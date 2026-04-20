-- Enable RLS on tables that were missing it.
-- All policies follow the principle of least privilege:
-- users can only access data they own or directly participate in.

-- ─── developer_profiles ──────────────────────────────────────────────────────
-- Public read: developers must be searchable by clients on the marketplace.
-- Writes restricted to the developer owning the row.
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read developer profiles"
  ON developer_profiles FOR SELECT USING (true);

CREATE POLICY "Developer inserts own profile"
  ON developer_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Developer updates own profile"
  ON developer_profiles FOR UPDATE USING (auth.uid() = id);

-- ─── notifications ────────────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role inserts notifications"
  ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─── chat_messages ────────────────────────────────────────────────────────────
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants can read messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Sender inserts own messages"
  ON chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receiver marks messages as read"
  ON chat_messages FOR UPDATE USING (auth.uid() = receiver_id);

-- ─── help_sessions ────────────────────────────────────────────────────────────
ALTER TABLE help_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session participants can view"
  ON help_sessions FOR SELECT
  USING (auth.uid() = developer_id OR auth.uid() = client_id);

CREATE POLICY "Developer creates session"
  ON help_sessions FOR INSERT WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Session participants can update"
  ON help_sessions FOR UPDATE
  USING (auth.uid() = developer_id OR auth.uid() = client_id);

-- ─── session_messages ─────────────────────────────────────────────────────────
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session message participants can read"
  ON session_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM help_sessions s
      WHERE s.id = session_id
        AND (s.developer_id = auth.uid() OR s.client_id = auth.uid())
    )
  );

CREATE POLICY "Session participants can insert messages"
  ON session_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM help_sessions s
      WHERE s.id = session_id
        AND (s.developer_id = auth.uid() OR s.client_id = auth.uid())
    )
  );

-- ─── session_summaries ────────────────────────────────────────────────────────
ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session summary participants can read"
  ON session_summaries FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = developer_id);

CREATE POLICY "Participants can insert summary"
  ON session_summaries FOR INSERT
  WITH CHECK (auth.uid() = client_id OR auth.uid() = developer_id);

-- ─── developer_payments ───────────────────────────────────────────────────────
ALTER TABLE developer_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developer sees own payments"
  ON developer_payments FOR SELECT USING (auth.uid() = developer_id);

-- Inserts come from edge functions using service_role; no client-side INSERT policy needed.

-- ─── help_request_history ─────────────────────────────────────────────────────
ALTER TABLE help_request_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "History visible to ticket participants"
  ON help_request_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM help_requests r
      WHERE r.id = help_request_id
        AND (r.client_id = auth.uid() OR r.selected_developer_id = auth.uid())
    )
  );

-- Inserts are done via triggers/RPC with service_role; no client INSERT policy needed.

-- ─── developer_application_counts ────────────────────────────────────────────
ALTER TABLE developer_application_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developer sees own application counts"
  ON developer_application_counts FOR SELECT
  USING (auth.uid() = developer_id);

CREATE POLICY "Developer manages own application counts"
  ON developer_application_counts FOR ALL
  USING (auth.uid() = developer_id);
