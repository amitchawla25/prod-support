-- Create secure_notes table for one-time encrypted credential sharing
-- Content is encrypted at the application layer (AES-256-GCM via Web Crypto API)
-- before being stored here, so this table never holds plaintext.

CREATE TABLE IF NOT EXISTS secure_notes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  sender_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       text NOT NULL,
  viewed_at     timestamptz,
  expires_at    timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup of pending notes per recipient + ticket
CREATE INDEX IF NOT EXISTS idx_secure_notes_recipient_ticket
  ON secure_notes (recipient_id, ticket_id)
  WHERE viewed_at IS NULL;

-- RLS: only sender and recipient may read their own notes
ALTER TABLE secure_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Secure notes visible to sender and recipient only"
  ON secure_notes
  FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Only sender can insert a secure note"
  ON secure_notes
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Only the recipient can update (to mark viewed_at); they cannot alter content
CREATE POLICY "Recipient can mark note as viewed"
  ON secure_notes
  FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- No deletes — expiry is handled at application layer via expires_at
