import { TicketStatus, TicketStatusLabels, TicketStatusColors } from './constants/ticketStatuses';

export type UserType = 'client' | 'developer' | 'system';

const STATUS_ALIASES: Record<string, string> = {
  ready_for_qa: TicketStatus.READY_FOR_CLIENT_QA,
  qa_fail: TicketStatus.REOPENED,
  qa_pass: TicketStatus.RESOLVED,
  ready_for_final_action: TicketStatus.RESOLVED,
  cancelled: TicketStatus.CANCELLED_BY_CLIENT,
  approved: TicketStatus.IN_PROGRESS,
};

const normalizeStatus = (status: string): string => status?.toLowerCase().trim().replace(/[-\s]/g, '_');

const canonicalStatus = (status: string): string => {
  const normalized = normalizeStatus(status);
  return STATUS_ALIASES[normalized] || normalized;
};

export const getTicketStatusStyles = (status: string) => {
  const key = canonicalStatus(status) as keyof typeof TicketStatusColors;
  return TicketStatusColors[key] || 'bg-gray-200 text-gray-900 border border-gray-300 px-2 py-1 rounded-full text-xs font-medium';
};

export const formatTicketStatus = (status: string) => {
  const key = canonicalStatus(status) as keyof typeof TicketStatusLabels;
  const label = TicketStatusLabels[key];
  if (label) return label;
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getStatusLabel = (status: string): string => formatTicketStatus(status);

export const getStatusDescription = (status: string): string => {
  const current = canonicalStatus(status);
  const descriptions: Record<string, string> = {
    [TicketStatus.OPEN]: 'Ticket is open and available for developers to apply.',
    [TicketStatus.AWAITING_CLIENT_APPROVAL]: 'Developers have applied. Waiting for client to select one.',
    [TicketStatus.IN_PROGRESS]: 'Developer is actively working on this ticket.',
    [TicketStatus.READY_FOR_CLIENT_QA]: 'Developer has submitted work for client review.',
    [TicketStatus.RESOLVED]: 'Issue has been resolved successfully.',
    [TicketStatus.REOPENED]: 'Client requested changes. Developer needs to continue work.',
    [TicketStatus.CANCELLED_BY_CLIENT]: 'This ticket has been cancelled by the client.',
  };

  return descriptions[current] || 'No description available.';
};

const statusTransitions: Record<string, Partial<Record<Exclude<UserType, 'system'>, string[]>>> = {
  [TicketStatus.IN_PROGRESS]: {
    developer: [TicketStatus.READY_FOR_CLIENT_QA],
    client: [TicketStatus.CANCELLED_BY_CLIENT],
  },
  [TicketStatus.READY_FOR_CLIENT_QA]: {
    client: [TicketStatus.RESOLVED, TicketStatus.REOPENED],
  },
  [TicketStatus.REOPENED]: {
    developer: [TicketStatus.IN_PROGRESS],
    client: [TicketStatus.CANCELLED_BY_CLIENT],
  },
  [TicketStatus.AWAITING_CLIENT_APPROVAL]: {
    client: [TicketStatus.CANCELLED_BY_CLIENT],
  },
  [TicketStatus.OPEN]: {
    client: [TicketStatus.CANCELLED_BY_CLIENT],
  },
};

export const isValidStatusTransition = (
  from: string,
  to: string,
  role: UserType,
): boolean => {
  if (role === 'system') return true;

  const fromStatus = canonicalStatus(from);
  const toStatus = canonicalStatus(to);
  if (fromStatus === toStatus) return true;

  const allowed = statusTransitions[fromStatus]?.[role] || [];
  return allowed.map(canonicalStatus).includes(toStatus);
};

export const getAllowedStatusTransitions = (
  status: string,
  role: 'developer' | 'client',
): string[] => {
  const current = canonicalStatus(status);
  return statusTransitions[current]?.[role] || [];
};

export const updateTicketStatus = async (
  ticketId: string,
  newStatus: string,
  userType: UserType,
  notes?: string,
): Promise<any> => {
  return {
    id: ticketId,
    status: canonicalStatus(newStatus),
    updated_by: userType,
    notes,
    updated_at: new Date().toISOString(),
  };
};
