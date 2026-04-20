
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const ALLOWED_ORIGINS = [
  "https://prod-support.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required", success: false }),
        { status: 400, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authorized", success: false }),
        { status: 401, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    // Verify the calling user via their JWT — this is the authoritative user ID
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Not authorized", success: false }),
        { status: 401, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    // Confirm user is a developer
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError || profileData?.user_type !== "developer") {
      return new Response(
        JSON.stringify({ error: "Only developers can be verified", success: false }),
        { status: 403, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", success: false }),
        { status: 400, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    // Validate amount: must be $29.99
    if (session.amount_total !== 2999) {
      console.error("[verify-developer-payment] Unexpected amount:", session.amount_total);
      return new Response(
        JSON.stringify({ error: "Invalid payment amount", success: false }),
        { status: 400, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    // Confirm the Stripe session belongs to this user
    const sessionUserId = session.client_reference_id || session.metadata?.user_id;
    if (sessionUserId && sessionUserId !== user.id) {
      console.error("[verify-developer-payment] User ID mismatch:", sessionUserId, "vs", user.id);
      return new Response(
        JSON.stringify({ error: "Session does not belong to this user", success: false }),
        { status: 403, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();

    // Use service role to update developer_profiles (bypasses RLS for this privileged operation)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: upsertError } = await supabaseAdmin
      .from("developer_profiles")
      .upsert({ id: user.id, premium_verified: true, payment_completed_at: now }, { onConflict: "id" });

    if (upsertError) {
      console.error("[verify-developer-payment] Error updating developer_profiles:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to update developer status", success: false }),
        { status: 500, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    // Record payment (non-fatal if it fails — webhook is the primary path)
    await supabaseAdmin.from("developer_payments").insert({
      developer_id: user.id,
      amount: 2999,
      currency: "usd",
      payment_intent_id: session.payment_intent as string,
      payment_status: "completed",
    }).then(({ error }) => {
      if (error) console.warn("[verify-developer-payment] Payment record error (non-fatal):", error);
    });

    return new Response(
      JSON.stringify({ success: true, verified: true, message: "Developer account verified successfully" }),
      { status: 200, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[verify-developer-payment] Server error:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
    );
  }
});
