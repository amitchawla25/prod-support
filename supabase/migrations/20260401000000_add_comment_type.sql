-- Add comment_type and parent_comment_id to ticket_comments
-- comment_type distinguishes regular messages from kickoff questions/answers
-- parent_comment_id allows answers to be threaded under their question

ALTER TABLE ticket_comments
  ADD COLUMN IF NOT EXISTS comment_type text NOT NULL DEFAULT 'message',
  ADD COLUMN IF NOT EXISTS parent_comment_id uuid REFERENCES ticket_comments(id) ON DELETE SET NULL;

-- Index for efficient filtering by comment_type per ticket
CREATE INDEX IF NOT EXISTS idx_ticket_comments_comment_type
  ON ticket_comments (ticket_id, comment_type);

-- Index for threading answers to questions
CREATE INDEX IF NOT EXISTS idx_ticket_comments_parent
  ON ticket_comments (parent_comment_id)
  WHERE parent_comment_id IS NOT NULL;
