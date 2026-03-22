
export interface HelpRequest {
  id?: string;
  client_id?: string;
  title?: string;
  description?: string;
  status?: string;
  technical_area?: string[];
  complexity_level?: string;
  urgency?: string;
  estimated_duration?: number;
  code_snippet?: string;
  communication_preference?: string[];
  budget_range?: string;
  created_at?: string;
  updated_at?: string;
  ticket_number?: number;
  attachments?: any[] | string | null;
  
  // Additional properties
  nda_required?: boolean;
  preferred_developer_location?: string;
  preferred_developer_experience?: string;
  developer_qa_notes?: string;
  client_feedback?: string;
  cancellation_reason?: string;
  selected_developer_id?: string;
  
  // Previously missing properties causing build errors
  qa_start_time?: string;
  qa_complete_time?: string;
  client_review_start_time?: string;
  client_review_complete_time?: string;

  // Time tracking
  in_progress_at?: string;
}

export interface HelpSession {
  id?: string;
  request_id?: string;
  developer_id?: string;
  client_id?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  status?: string;
  shared_code?: string;
  final_cost?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HelpRequestHistoryItem {
  id?: string;
  help_request_id?: string;
  changed_by?: string;
  changed_at?: string;
  change_type?: string;
  previous_status?: string;
  new_status?: string;
  change_details?: any;
}

export interface DeveloperProfile {
  id: string;
  skills: string[];
  experience: string;
  hourly_rate: number;
}

export interface Profile {
  id?: string; 
  name?: string;
  image?: string;
  description?: string;
  location?: string;
}

export interface HelpRequestMatch {
  id?: string;
  request_id?: string;
  developer_id?: string;
  status?: string;
  match_score?: number;
  proposed_rate?: number;
  proposed_duration?: number;
  proposed_message?: string;
  created_at?: string;
  updated_at?: string;
  profiles?: Profile;
  developer_profiles?: DeveloperProfile | null | any; // Updated to handle error cases
  help_requests?: HelpRequest; // Added for ApplicationDetailPage
}

// Define TicketComment to include user field
export interface TicketComment {
  id?: string;
  ticket_id?: string;
  user_id?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  is_internal?: boolean;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface TicketHistoryEntry {
  id?: string;
  ticket_id?: string;
  user_id?: string;
  action_type?: string;
  previous_value?: string;
  new_value?: string;
  created_at?: string;
}

// Updated UserType to include 'system'
export type UserType = 'client' | 'developer' | 'system';

// Constants for form options
export const technicalAreaOptions = [
  'React',
  'Angular',
  'Vue',
  'Next.js',
  'Node.js',
  'Express',
  'MongoDB',
  'PostgreSQL',
  'TypeScript',
  'JavaScript',
  'CSS',
  'HTML',
  'Redux',
  'GraphQL',
  'REST API',
  'Authentication',
  'AWS',
  'Docker',
  'Firebase',
  'UI/UX',
  'Testing',
  'DevOps',
  'Mobile',
  'Other'
];

export const communicationOptions = [
  'Chat',
  'Voice Call',
  'Video Call',
  'Screen Share',
  'Code Collaboration'
];

export const budgetRangeOptions = [
  '$0 - $50',
  '$50 - $100',
  '$100 - $200',
  '$200 - $500',
  '$500+'
];

export const urgencyOptions = [
  { value: 'low', label: 'Low - Within a week' },
  { value: 'medium', label: 'Medium - Within a few days' },
  { value: 'high', label: 'High - Within 24 hours' },
  { value: 'critical', label: 'Critical - ASAP' }
];

export const locationOptions = [
  { value: 'Global', label: 'Global (Any Location)' },
  { value: 'North America', label: 'North America' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Australia', label: 'Australia/Oceania' },
  { value: 'South America', label: 'South America' },
  { value: 'Africa', label: 'Africa' }
];
