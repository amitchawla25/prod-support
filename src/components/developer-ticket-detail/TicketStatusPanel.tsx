
import React from "react";
import { HelpRequest } from "../../types/helpRequest";
import { 
  ClipboardCheck, 
  Users, 
  Award, 
  FileQuestion, 
  MessageCircle, 
  FileEdit, 
  CheckCheck, 
  ThumbsDown, 
  ThumbsUp
} from "lucide-react";
import { HELP_REQUEST_STATUSES } from "../../utils/constants/statusConstants";

const TicketStatusPanel: React.FC<{ ticket: HelpRequest }> = ({ ticket }) => {
  // Special status messages
  const statusMessages = {
    [HELP_REQUEST_STATUSES.OPEN]: {
      bg: "bg-blue-50 border-blue-200",
      icon: Users,
      iconColor: "text-blue-600",
      title: "Open — Accepting Applications",
      description: "This ticket is open. Developers can apply to work on it."
    },
    [HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL]: {
      bg: "bg-yellow-50 border-yellow-200",
      icon: ClipboardCheck,
      iconColor: "text-yellow-600",
      title: "Pending Your Approval",
      description: "A developer has applied. Review their application in the sidebar and approve or reject."
    },
    [HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW]: {
      bg: "bg-blue-50 border-blue-200",
      icon: FileQuestion,
      iconColor: "text-blue-600",
      title: "Requirements Review",
      description: "Developer is reviewing the requirements before starting work."
    },
    [HELP_REQUEST_STATUSES.NEED_MORE_INFO]: {
      bg: "bg-amber-50 border-amber-200",
      icon: MessageCircle,
      iconColor: "text-amber-600",
      title: "More Information Needed",
      description: "Developer needs more information to proceed with your request."
    },
    [HELP_REQUEST_STATUSES.IN_PROGRESS]: {
      bg: "bg-purple-50 border-purple-200",
      icon: FileEdit,
      iconColor: "text-purple-600",
      title: "In Progress",
      description: "Developer is actively working on this request."
    },
    [HELP_REQUEST_STATUSES.READY_FOR_QA]: {
      bg: "bg-indigo-50 border-indigo-200",
      icon: ClipboardCheck,
      iconColor: "text-indigo-600",
      title: "Quality Assurance Submitted",
      description: "Work has been submitted and is waiting for your review."
    },
    [HELP_REQUEST_STATUSES.READY_FOR_CLIENT_QA]: {
      bg: "bg-indigo-50 border-indigo-200",
      icon: ClipboardCheck,
      iconColor: "text-indigo-600",
      title: "Quality Assurance Submitted",
      description: "Work has been submitted and is waiting for your review."
    },
    [HELP_REQUEST_STATUSES.QA_FAIL]: {
      bg: "bg-rose-50 border-rose-200",
      icon: ThumbsDown,
      iconColor: "text-rose-600",
      title: "QA Failed",
      description: "You've requested changes to the submitted work."
    },
    [HELP_REQUEST_STATUSES.QA_PASS]: {
      bg: "bg-teal-50 border-teal-200",
      icon: ThumbsUp,
      iconColor: "text-teal-600",
      title: "QA Passed",
      description: "You've approved the work! Developer is preparing for final completion."
    },
    [HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION]: {
      bg: "bg-emerald-50 border-emerald-200",
      icon: CheckCheck,
      iconColor: "text-emerald-600",
      title: "Ready for Final Actions",
      description: "Developer is finalizing your request."
    },
    [HELP_REQUEST_STATUSES.RESOLVED]: {
      bg: "bg-green-50 border-green-200",
      icon: Award,
      iconColor: "text-green-600",
      title: "Request Resolved",
      description: "This request has been successfully completed!"
    },
    [HELP_REQUEST_STATUSES.APPROVED]: {
      bg: "bg-green-50 border-green-200",
      icon: Users,
      iconColor: "text-green-600",
      title: "Developer Approved",
      description: "Developer has been approved and can start working on this request."
    }
  };

  const statusInfo = statusMessages[ticket?.status as keyof typeof statusMessages];
  
  if (!statusInfo) return null;
  
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`mb-6 p-4 rounded-md ${statusInfo.bg}`}>
      <div className="flex items-center">
        <StatusIcon className={`h-5 w-5 mr-3 ${statusInfo.iconColor}`} />
        <div>
          <h3 className="font-medium">{statusInfo.title}</h3>
          <p className="text-sm">{statusInfo.description}</p>
        </div>
      </div>
    </div>
  );
};

export default TicketStatusPanel;
