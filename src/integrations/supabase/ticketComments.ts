
import { supabase } from "./client";
import type { TicketComment } from "../../types/helpRequest";

export type CommentType = 'message' | 'kickoff_question' | 'kickoff_answer';

// Fetch comments for a ticket, optionally filtered by comment_type
export const getTicketComments = async (
  ticketId: string,
  commentType?: CommentType
): Promise<{ success: boolean; data?: TicketComment[]; error?: string }> => {
  let query = supabase
    .from("ticket_comments")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (commentType) {
    query = query.eq("comment_type", commentType);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TicketComment[] };
};

// Add a new comment to a ticket
export const addTicketComment = async ({
  ticket_id,
  user_id,
  content,
  is_internal = false,
  comment_type = 'message',
  parent_comment_id,
}: {
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal?: boolean;
  comment_type?: CommentType;
  parent_comment_id?: string;
}): Promise<{ success: boolean; data?: TicketComment; error?: string }> => {
  const { data, error } = await supabase
    .from("ticket_comments")
    .insert([{ ticket_id, user_id, content, is_internal, comment_type, parent_comment_id }])
    .select()
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TicketComment };
};
