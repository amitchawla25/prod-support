import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotificationType =
  | "new_application"
  | "application_approved"
  | "ticket_resolved";

interface EmailPayload {
  type: NotificationType;
  recipient_user_id: string;
  data: {
    ticket_title: string;
    ticket_id: string;
    developer_name?: string;
    client_name?: string;
    app_url?: string;
  };
}

function buildEmailContent(type: NotificationType, data: EmailPayload["data"]): { subject: string; html: string } {
  const appUrl = data.app_url || "https://prod-support-phi.vercel.app";
  const ticketUrl = `${appUrl}/client/tickets/${data.ticket_id}`;

  switch (type) {
    case "new_application":
      return {
        subject: `A developer applied to: "${data.ticket_title}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
            <h2 style="color: #1E3A8A; margin-top: 0;">Someone wants to help you get unstuck</h2>
            <p style="color: #374151; font-size: 16px;">
              <strong>${data.developer_name || "A developer"}</strong> has applied to your help request:
            </p>
            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600; color: #111827;">${data.ticket_title}</p>
            </div>
            <p style="color: #374151;">Review their application and approve them to get started.</p>
            <a href="${ticketUrl}" style="display: inline-block; background: #1E3A8A; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
              Review Application
            </a>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">You're receiving this because you posted a help request on ProdSupport.</p>
          </div>
        `,
      };

    case "application_approved":
      return {
        subject: `You got selected — "${data.ticket_title}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
            <h2 style="color: #1E3A8A; margin-top: 0;">You've been selected!</h2>
            <p style="color: #374151; font-size: 16px;">
              <strong>${data.client_name || "A client"}</strong> approved your application for:
            </p>
            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600; color: #111827;">${data.ticket_title}</p>
            </div>
            <p style="color: #374151;">Head to the ticket to see the details and get started.</p>
            <a href="${appUrl}/developer/dashboard" style="display: inline-block; background: #1E3A8A; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
              View Ticket
            </a>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">You're receiving this because you applied to a help request on ProdSupport.</p>
          </div>
        `,
      };

    case "ticket_resolved":
      return {
        subject: `Session complete — "${data.ticket_title}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
            <h2 style="color: #1E3A8A; margin-top: 0;">Your session is complete</h2>
            <p style="color: #374151; font-size: 16px;">The following help request has been marked as resolved:</p>
            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600; color: #111827;">${data.ticket_title}</p>
            </div>
            <p style="color: #374151;">If you found this helpful, please take a moment to leave a rating — it helps developers get more work.</p>
            <a href="${ticketUrl}" style="display: inline-block; background: #1E3A8A; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
              Leave a Rating
            </a>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">You're receiving this because you used ProdSupport.</p>
          </div>
        `,
      };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: EmailPayload = await req.json();
    const { type, recipient_user_id, data } = payload;

    if (!type || !recipient_user_id || !data?.ticket_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, recipient_user_id, data.ticket_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role key to look up user email from auth.users
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(recipient_user_id);
    if (userError || !userData?.user?.email) {
      console.error("Could not look up recipient email:", userError);
      return new Response(
        JSON.stringify({ error: "Could not find recipient email" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipientEmail = userData.user.email;
    const { subject, html } = buildEmailContent(type, data);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ProdSupport <notifications@prodsupport.dev>",
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error("Resend API error:", errorBody);
      return new Response(
        JSON.stringify({ error: "Failed to send email", detail: errorBody }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendData = await resendResponse.json();
    console.log(`Email sent (${type}) to ${recipientEmail}:`, resendData.id);

    return new Response(
      JSON.stringify({ success: true, email_id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
