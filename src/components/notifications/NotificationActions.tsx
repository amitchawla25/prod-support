
import React from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { updateApplicationStatus } from '../../integrations/supabase/helpRequestsApplications';
import { useAuth } from '../../contexts/auth';
import { useNavigate } from 'react-router-dom';

interface NotificationActionsProps {
  notification: {
    id: string;
    notification_type: string;
    action_data?: {
      application_id?: string;
      developer_name?: string;
      request_title?: string;
      request_id?: string;
      status?: string;
    };
  };
  onActionComplete: () => void;
}

const NotificationActions: React.FC<NotificationActionsProps> = ({ 
  notification, 
  onActionComplete 
}) => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  // If notification_type is not specified or action_data is undefined, don't render anything
  if (!notification.notification_type || !notification.action_data) {
    return null;
  }

  const handleAccept = async () => {
    if (!userId || !notification.action_data?.application_id) return;
    
    try {
      toast.loading('Accepting application...');
      const result = await updateApplicationStatus(
        notification.action_data.application_id,
        'approved',
        userId
      );
      
      if (result.success) {
        toast.success('Application accepted successfully');
        onActionComplete();
      } else {
        toast.error('Failed to accept application');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('An error occurred while accepting the application');
    }
  };

  const handleReject = async () => {
    if (!userId || !notification.action_data?.application_id) return;
    
    try {
      toast.loading('Rejecting application...');
      const result = await updateApplicationStatus(
        notification.action_data.application_id,
        'rejected',
        userId
      );
      
      if (result.success) {
        toast.success('Application rejected');
        onActionComplete();
      } else {
        toast.error('Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('An error occurred while rejecting the application');
    }
  };

  const handleViewRequest = () => {
    if (notification.action_data?.request_id) {
      navigate(`/client/tickets/${notification.action_data.request_id}`);
    }
  };

  // Show different actions based on notification type
  if (notification.notification_type === 'new_application') {
    return (
      <div className="flex gap-2 mt-2">
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={handleReject}
          className="flex-1"
        >
          Reject
        </Button>
        <Button 
          size="sm"
          onClick={handleAccept}
          className="flex-1"
        >
          Accept
        </Button>
      </div>
    );
  }

  if (notification.notification_type.startsWith('application_')) {
    return (
      <div className="mt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleViewRequest}
          className="w-full"
        >
          View Request
        </Button>
      </div>
    );
  }

  if (
    notification.notification_type === 'ticket_accepted' ||
    notification.notification_type === 'kickoff_questions_sent' ||
    notification.notification_type === 'kickoff_answered' ||
    notification.notification_type === 'secure_note_shared'
  ) {
    return (
      <div className="mt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleViewRequest}
          className="w-full"
        >
          View Ticket
        </Button>
      </div>
    );
  }

  return null;
};

export default NotificationActions;
