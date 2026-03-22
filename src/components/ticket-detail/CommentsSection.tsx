
import React from 'react';
import TicketComments from "../tickets/TicketComments";
import { HelpRequest } from "../../types/helpRequest";

interface CommentsSectionProps {
  visible: boolean;
  ticket?: HelpRequest;
  ticketId?: string;
  userId: string;
  role?: string;
  userRole?: string;
  userType?: string;
}

const CommentsSection = ({
  visible,
  ticket,
  ticketId,
  userId,
  role,
  userRole,
  userType,
}: CommentsSectionProps) => {
  if (!visible) return null;

  const effectiveRole = role || userRole || userType;

  return (
    <TicketComments
      ticketId={ticketId}
      userId={userId}
      role={effectiveRole}
      ticket={ticket}
    />
  );
};

export default CommentsSection;
