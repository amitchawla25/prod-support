
// Application Status
export const MATCH_STATUSES = {
  PENDING: 'pending',
  APPROVED_BY_CLIENT: 'approved',
  REJECTED_BY_CLIENT: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Help Request Status
export const REQUEST_STATUSES = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PENDING_REVIEW: 'pending_review'
};

// Session Status
export const SESSION_STATUSES = {
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Help Request Workflow Statuses
export const HELP_REQUEST_STATUSES = {
  OPEN: 'open',
  PENDING_MATCH: 'pending_match',
  AWAITING_CLIENT_APPROVAL: 'awaiting_client_approval',
  APPROVED: 'approved',
  REQUIREMENTS_REVIEW: 'requirements_review',
  NEED_MORE_INFO: 'need_more_info',
  IN_PROGRESS: 'in_progress',
  READY_FOR_QA: 'ready_for_qa',
  READY_FOR_CLIENT_QA: 'ready_for_client_qa',
  QA_FAIL: 'qa_fail',
  QA_PASS: 'qa_pass',
  READY_FOR_FINAL_ACTION: 'ready_for_final_action',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  
  // Aliases for backward compatibility
  SUBMITTED: 'open',
  DEV_REQUESTED: 'pending_match',
  PENDING_DEVELOPER_APPROVAL: 'awaiting_client_approval'
};

// Utility function to normalize status strings for comparison
export const normalizeStatus = (status: string): string => {
  return status.toLowerCase().replace(/[_\s-]/g, '');
};
