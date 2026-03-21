-- Fix infinite recursion between help_requests and help_request_matches RLS policies.
-- The circular dependency:
--   help_requests SELECT policy -> queries help_request_matches
--   help_request_matches UPDATE policy -> queries help_requests
-- Solution: use SECURITY DEFINER functions that bypass RLS for the cross-table checks.

-- Drop the two policies involved in the cycle
DROP POLICY IF EXISTS "Developers can view relevant help requests" ON help_requests;
DROP POLICY IF EXISTS "Clients can update matches on own tickets" ON help_request_matches;

-- Security definer function: checks help_request_matches without triggering help_requests RLS
CREATE OR REPLACE FUNCTION is_developer_on_request(p_request_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM help_request_matches
    WHERE request_id = p_request_id
      AND developer_id = p_user_id
  );
$$;

-- Security definer function: checks help_requests without triggering help_request_matches RLS
CREATE OR REPLACE FUNCTION is_client_of_request(p_request_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM help_requests
    WHERE id = p_request_id
      AND client_id = p_user_id
  );
$$;

-- Recreate developer view policy using the security definer function
CREATE POLICY "Developers can view relevant help requests"
  ON help_requests FOR SELECT
  USING (
    is_developer_on_request(id, auth.uid())
    OR auth.uid() = selected_developer_id
  );

-- Recreate client update matches policy using the security definer function
CREATE POLICY "Clients can update matches on own tickets"
  ON help_request_matches FOR UPDATE
  USING (
    is_client_of_request(request_id, auth.uid())
  );
