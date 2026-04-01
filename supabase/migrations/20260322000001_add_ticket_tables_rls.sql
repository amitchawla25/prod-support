-- Enable RLS on ticket_comments and ticket_history tables
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;

-- ticket_comments: users can read comments on tickets they're involved in
CREATE POLICY "Users can view comments on their tickets"
ON ticket_comments FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM help_requests
    WHERE help_requests.id = ticket_comments.ticket_id
    AND (help_requests.client_id = auth.uid() OR help_requests.selected_developer_id = auth.uid())
  )
);

-- ticket_comments: users can only insert their own comments on their tickets
CREATE POLICY "Users can add comments on their tickets"
ON ticket_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM help_requests
    WHERE help_requests.id = ticket_comments.ticket_id
    AND (help_requests.client_id = auth.uid() OR help_requests.selected_developer_id = auth.uid())
  )
);

-- ticket_history: readable by the client or developer on the ticket
CREATE POLICY "Users can view history on their tickets"
ON ticket_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM help_requests
    WHERE help_requests.id = ticket_history.ticket_id
    AND (help_requests.client_id = auth.uid() OR help_requests.selected_developer_id = auth.uid())
  )
);

-- ticket_history: users can only insert history entries they authored on their tickets
CREATE POLICY "Users can insert history on their tickets"
ON ticket_history FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM help_requests
    WHERE help_requests.id = ticket_history.ticket_id
    AND (help_requests.client_id = auth.uid() OR help_requests.selected_developer_id = auth.uid())
  )
);
