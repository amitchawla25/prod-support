
// Notification type values
export type NotificationType =
  | 'new_application'
  | 'application_approved'
  | 'ticket_resolved'
  | 'ticket_accepted'
  | 'kickoff_questions_sent'
  | 'kickoff_answered'
  | 'secure_note_shared';

export interface ExtendedNotification {
  id: string;
  user_id: string;
  related_entity_id: string;
  entity_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  notification_type: string;
  action_data?: {
    application_id?: string;
    developer_name?: string;
    developer_id?: string;
    request_title?: string;
    request_id?: string;
    status?: string;
    secure_note_id?: string;
  };
}
