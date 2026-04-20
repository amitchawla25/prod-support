import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    console.log("[stripe-webhook] Session not paid, ignoring:", session.id);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // Validate amount: must be $29.99 (2999 cents)
  if (session.amount_total !== 2999) {
    console.error("[stripe-webhook] Unexpected amount:", session.amount_total);
    return new Response("Invalid amount", { status: 400 });
  }

  const userId = session.client_reference_id || session.metadata?.user_id;
  if (!userId) {
    console.error("[stripe-webhook] No user ID in session:", session.id);
    return new Response("Missing user ID", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const now = new Date().toISOString();

  // Upsert developer_profiles
  const { error: profileError } = await supabase
    .from("developer_profiles")
    .upsert({ id: userId, premium_verified: true, payment_completed_at: now }, { onConflict: "id" });

  if (profileError) {
    console.error("[stripe-webhook] Error updating developer_profiles:", profileError);
    return new Response("Database error", { status: 500 });
  }

  // Record the payment
  const { error: paymentError } = await supabase.from("developer_payments").insert({
    developer_id: userId,
    amount: 2999,
    currency: "usd",
    payment_intent_id: session.payment_intent as string,
    payment_status: "completed",
  });

  if (paymentError) {
    console.error("[stripe-webhook] Error recording payment (non-fatal):", paymentError);
  }

  console.log("[stripe-webhook] Developer verified successfully:", userId);
  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
