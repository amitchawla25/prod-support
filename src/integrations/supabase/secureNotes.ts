import { supabase } from "./client";
import { createNotification } from "./notifications";

// Derives a deterministic AES-GCM key from ticketId + senderId.
// The key never leaves the browser — Supabase only stores the ciphertext.
async function deriveKey(ticketId: string, senderId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${ticketId}:${senderId}`),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("prodSupport-v1"),
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptContent(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  // Encode iv + ciphertext as base64 separated by ":"
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return `${ivB64}:${ctB64}`;
}

async function decryptContent(encrypted: string, key: CryptoKey): Promise<string> {
  const [ivB64, ctB64] = encrypted.split(":");
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}

// Create and share a secure one-time note
export const createSecureNote = async ({
  ticketId,
  senderId,
  recipientId,
  plaintext,
  ticketTitle,
}: {
  ticketId: string;
  senderId: string;
  recipientId: string;
  plaintext: string;
  ticketTitle: string;
}): Promise<{ success: boolean; noteId?: string; error?: string }> => {
  try {
    const key = await deriveKey(ticketId, senderId);
    const encrypted = await encryptContent(plaintext, key);

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("secure_notes")
      .insert([
        {
          ticket_id: ticketId,
          sender_id: senderId,
          recipient_id: recipientId,
          content: encrypted,
          expires_at: expiresAt,
        },
      ])
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[secureNotes] Insert error:", error);
      return { success: false, error: error.message };
    }

    // Notify the recipient
    await createNotification({
      user_id: recipientId,
      related_entity_id: ticketId,
      entity_type: 'help_request',
      title: 'Secure Note Shared',
      message: `A secure note has been shared with you for "${ticketTitle}". It is only viewable once and expires in 48 hours.`,
      notification_type: 'secure_note_shared',
      action_data: { request_id: ticketId, request_title: ticketTitle },
    });

    return { success: true, noteId: data?.id };
  } catch (e) {
    console.error("[secureNotes] createSecureNote error:", e);
    return { success: false, error: "Failed to create secure note" };
  }
};

// View a secure note — marks it as viewed (one-time)
export const viewSecureNote = async ({
  noteId,
  ticketId,
  senderId,
  recipientId,
}: {
  noteId: string;
  ticketId: string;
  senderId: string;
  recipientId: string;
}): Promise<{ success: boolean; plaintext?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("secure_notes")
      .select("content, viewed_at, expires_at, sender_id, recipient_id")
      .eq("id", noteId)
      .eq("ticket_id", ticketId)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: "Secure note not found." };
    }

    if (data.recipient_id !== recipientId) {
      return { success: false, error: "Access denied." };
    }

    if (data.viewed_at) {
      return { success: false, error: "This note has already been viewed and is no longer available." };
    }

    if (new Date(data.expires_at) < new Date()) {
      return { success: false, error: "This note has expired." };
    }

    const key = await deriveKey(ticketId, data.sender_id);
    const plaintext = await decryptContent(data.content, key);

    // Mark as viewed (burn after read)
    await supabase
      .from("secure_notes")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", noteId);

    return { success: true, plaintext };
  } catch (e) {
    console.error("[secureNotes] viewSecureNote error:", e);
    return { success: false, error: "Failed to retrieve secure note." };
  }
};

// Fetch pending (unviewed) secure notes for a recipient on a ticket
export const getPendingSecureNotes = async (
  ticketId: string,
  recipientId: string
): Promise<{ success: boolean; data?: { id: string; created_at: string }[]; error?: string }> => {
  const { data, error } = await supabase
    .from("secure_notes")
    .select("id, created_at")
    .eq("ticket_id", ticketId)
    .eq("recipient_id", recipientId)
    .is("viewed_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data || [] };
};
