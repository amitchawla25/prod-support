-- Enable RLS on help_requests
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;

-- Clients can view their own tickets
CREATE POLICY "Clients can view own help requests"
  ON help_requests FOR SELECT
  USING (auth.uid() = client_id);

-- Developers can view tickets they applied to or are assigned to
CREATE POLICY "Developers can view relevant help requests"
  ON help_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM help_request_matches
      WHERE request_id = help_requests.id
        AND developer_id = auth.uid()
    )
    OR auth.uid() = selected_developer_id
  );

-- Clients can create tickets
CREATE POLICY "Clients can create help requests"
  ON help_requests FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Clients can update their own tickets (approve developer, cancel, etc.)
CREATE POLICY "Clients can update own help requests"
  ON help_requests FOR UPDATE
  USING (auth.uid() = client_id);

-- Assigned developer can update ticket status (submit work, QA notes, etc.)
CREATE POLICY "Assigned developer can update help request"
  ON help_requests FOR UPDATE
  USING (auth.uid() = selected_developer_id);

-- Enable RLS on help_request_matches
ALTER TABLE help_request_matches ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all matches (clients see applications on their tickets, devs see their own)
CREATE POLICY "Authenticated users can view matches"
  ON help_request_matches FOR SELECT
  USING (auth.role() = 'authenticated');

-- Developers can insert their own applications
CREATE POLICY "Developers can apply to requests"
  ON help_request_matches FOR INSERT
  WITH CHECK (auth.uid() = developer_id);

-- Clients can update match status on their own tickets (approve/reject applications)
CREATE POLICY "Clients can update matches on own tickets"
  ON help_request_matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM help_requests
      WHERE id = help_request_matches.request_id
        AND client_id = auth.uid()
    )
  );

-- Developers can update their own match record
CREATE POLICY "Developers can update own match"
  ON help_request_matches FOR UPDATE
  USING (auth.uid() = developer_id);
