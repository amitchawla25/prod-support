
import React, { useState, useEffect } from 'react';
import DeveloperApplicationPanel from '../../components/developer-ticket-detail/DeveloperApplicationPanel';
import StatusActionCard from './StatusActionCard';
import { UserType } from '../../types/enums';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Bug, Loader2 } from 'lucide-react';
import { getCurrentUserData } from '../../contexts/auth';

const TicketActionsPanel = ({
  role,
  ticket,
  ticketId,
  userId,
  applicationStatus,
  hasApplied,
  onApply,
  fetchLatestTicketData
}) => {
  const [developerProfile, setDeveloperProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchDeveloperProfile = async () => {
      if (role === 'developer' && userId) {
        try {
          const userData = await getCurrentUserData();
          setDeveloperProfile(userData);
        } catch (error) {
          console.error('Error fetching developer profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setIsLoadingProfile(false);
      }
    };

    fetchDeveloperProfile();
  }, [role, userId]);

  console.log('[TicketActionsPanel] Rendering with role:', role, 'ticket status:', ticket?.status, 
    'applicationStatus:', applicationStatus, 'hasApplied:', hasApplied);
  
  if (!ticket) {
    return (
      <Alert variant="destructive">
        <Bug className="h-4 w-4" />
        <AlertTitle>Error rendering actions</AlertTitle>
        <AlertDescription>Ticket data is missing or incomplete</AlertDescription>
      </Alert>
    );
  }
  
  if (role === "developer") {
    if (isLoadingProfile) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading your profile...</span>
        </div>
      );
    }

    if (applicationStatus !== "approved" || !hasApplied) {
      console.log('[TicketActionsPanel] Showing DeveloperApplicationPanel for non-approved developer');
      return (
        <DeveloperApplicationPanel
          devUpdateVisibility={{
            show: !!(applicationStatus === "approved" && hasApplied),
            reason: "",
          }}
          ticket={ticket}
          ticketId={ticketId}
          userType={role}
          applicationStatus={applicationStatus}
          hasApplied={hasApplied}
          onApply={onApply}
          fetchLatestTicketData={fetchLatestTicketData}
          isPaidDeveloper={developerProfile?.isPaidDeveloper ?? false}
          freeApplicationsRemaining={developerProfile?.freeApplicationsRemaining ?? 0}
          assignedTicketCount={developerProfile?.assignedTicketCount ?? 0}
          onUpgradeClick={() => window.location.href = '/developer/upgrade'}
        />
      );
    }
    
    console.log('[TicketActionsPanel] Showing StatusActionCard for approved developer');
    return (
      <StatusActionCard
        ticket={ticket}
        userType={role as UserType}
        onStatusUpdated={fetchLatestTicketData}
      />
    );
  }

  if (role === "client") {
    console.log('[TicketActionsPanel] Showing StatusActionCard for client');
    return (
      <StatusActionCard
        ticket={ticket}
        userType={role as UserType}
        onStatusUpdated={fetchLatestTicketData}
      />
    );
  }
  
  console.log('[TicketActionsPanel] No matching role found:', role);
  return null;
};

export default TicketActionsPanel;
