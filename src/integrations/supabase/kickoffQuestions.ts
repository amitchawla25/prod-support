import { supabase } from "./client";
import { addTicketComment, getTicketComments } from "./ticketComments";
import { createNotification } from "./notifications";

export interface KickoffQuestion {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string | null;
  answer?: KickoffQuestion;
}

// Templates a developer can pick from
export const KICKOFF_QUESTION_TEMPLATES = [
  "Please share repository access (GitHub/GitLab/Bitbucket).",
  "I'll need the environment variables / .env file to run this locally.",
  "Please provide staging or production server access if relevant.",
  "Can we schedule a brief alignment call? Please share your availability.",
  "Please share any design files (Figma, Sketch, etc.).",
  "What is the preferred deployment process for this project?",
] as const;

// Submit one or more kickoff questions from the developer
export const submitKickoffQuestions = async ({
  ticketId,
  developerId,
  clientId,
  questions,
  ticketTitle,
}: {
  ticketId: string;
  developerId: string;
  clientId: string;
  questions: string[];
  ticketTitle: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    for (const question of questions) {
      const result = await addTicketComment({
        ticket_id: ticketId,
        user_id: developerId,
        content: question,
        comment_type: 'kickoff_question',
        is_internal: false,
      });
      if (!result.success) {
        return { success: false, error: result.error };
      }
    }

    // Notify the client
    await createNotification({
      user_id: clientId,
      related_entity_id: ticketId,
      entity_type: 'help_request',
      title: 'Developer Needs Your Input',
      message: `The developer working on "${ticketTitle}" has questions before getting started. Please review and respond.`,
      notification_type: 'kickoff_questions_sent',
      action_data: { request_id: ticketId, request_title: ticketTitle },
    });

    return { success: true };
  } catch (e) {
    console.error('[kickoffQuestions] submitKickoffQuestions error:', e);
    return { success: false, error: 'Failed to submit kickoff questions' };
  }
};

// Fetch kickoff questions for a ticket (with answers threaded)
export const getKickoffQuestions = async (
  ticketId: string
): Promise<{ success: boolean; data?: KickoffQuestion[]; error?: string }> => {
  const { data, error } = await supabase
    .from("ticket_comments")
    .select("*")
    .eq("ticket_id", ticketId)
    .in("comment_type", ["kickoff_question", "kickoff_answer"])
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  // Thread answers under their questions
  const questions = (data || []).filter((c) => c.comment_type === 'kickoff_question') as KickoffQuestion[];
  const answers = (data || []).filter((c) => c.comment_type === 'kickoff_answer') as KickoffQuestion[];

  const threaded = questions.map((q) => ({
    ...q,
    answer: answers.find((a) => a.parent_comment_id === q.id),
  }));

  return { success: true, data: threaded };
};

// Submit an answer to a kickoff question
export const answerKickoffQuestion = async ({
  ticketId,
  clientId,
  developerId,
  questionId,
  answer,
  ticketTitle,
  allAnswered,
}: {
  ticketId: string;
  clientId: string;
  developerId: string;
  questionId: string;
  answer: string;
  ticketTitle: string;
  allAnswered: boolean;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await addTicketComment({
      ticket_id: ticketId,
      user_id: clientId,
      content: answer,
      comment_type: 'kickoff_answer',
      parent_comment_id: questionId,
      is_internal: false,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (allAnswered) {
      await createNotification({
        user_id: developerId,
        related_entity_id: ticketId,
        entity_type: 'help_request',
        title: 'Client Has Answered Your Questions',
        message: `The client has responded to all your kickoff questions for "${ticketTitle}". You are ready to begin.`,
        notification_type: 'kickoff_answered',
        action_data: { request_id: ticketId, request_title: ticketTitle },
      });
    }

    return { success: true };
  } catch (e) {
    console.error('[kickoffQuestions] answerKickoffQuestion error:', e);
    return { success: false, error: 'Failed to submit answer' };
  }
};

// Check if the developer has already submitted kickoff questions for this ticket
export const hasSubmittedKickoffQuestions = async (
  ticketId: string,
  developerId: string
): Promise<boolean> => {
  const { data } = await supabase
    .from("ticket_comments")
    .select("id")
    .eq("ticket_id", ticketId)
    .eq("user_id", developerId)
    .eq("comment_type", "kickoff_question")
    .limit(1);

  return (data?.length ?? 0) > 0;
};
