import { StatusTransitionDropdown } from '../components/ticket-detail/StatusTransitionDropdown';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { HelpRequest } from '../types/helpRequest';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { supabase } from '../integrations/supabase/client';
import TicketHeader from '../components/developer-ticket-detail/TicketHeader';
import TicketStatusPanel from '../components/developer-ticket-detail/TicketStatusPanel';
import { useAuth } from '../contexts/auth';
import HelpRequestHistoryDialog from '../components/help/HelpRequestHistoryDialog';
import DeveloperApplicationModal from '../components/apply/DeveloperApplicationModal';
import DeveloperQADialog from '../components/help/DeveloperQADialog';
import PostSessionRatingModal from '../components/help/PostSessionRatingModal';

import TicketActionsPanel from '../components/ticket-detail/TicketActionsPanel';
import CommentsSection from '../components/ticket-detail/CommentsSection';
import ClientEditSection from '../components/ticket-detail/ClientEditSection';
import HistorySection from '../components/ticket-detail/HistorySection';
import TicketDetails from '../components/tickets/TicketDetails';
import DeveloperApplicationsPanel from '../components/dashboard/DeveloperApplicationsPanel';
import DeadlineTracker from '../components/tickets/DeadlineTracker';
import KickoffQuestionsPanel from '../components/tickets/KickoffQuestionsPanel';
import ClientActionRequired from '../components/tickets/ClientActionRequired';
import SecureNoteComposer from '../components/tickets/SecureNoteComposer';
import SecureNoteViewer from '../components/tickets/SecureNoteViewer';

const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId, userType } = useAuth();
  const role = userType as "client" | "developer";
  const [applications, setApplications] = useState<HelpRequestMatch[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!ticketId || role !== 'client') return;

    setIsLoadingApplications(true);
    const { data } = await supabase
      .from('help_request_matches')
      .select(`*, profiles!developer_id(id, name, email, image, location)`)
      .eq('request_id', ticketId)
      .order('created_at', { ascending: false });

    setApplications(data || []);
    setIsLoadingApplications(false);
  }, [ticketId, role]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showQADialog, setShowQADialog] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [showSecureNoteComposer, setShowSecureNoteComposer] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to view this page');
      navigate('/login', { state: { returnTo: `/tickets/${ticketId}` } });
      return;
    }

    if (!userType || !['developer', 'client'].includes(userType)) {
      toast.error('Invalid user type');
      navigate('/');
      return;
    }

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId, isAuthenticated, userType]);

  useEffect(() => {
    if (!ticketId || !isAuthenticated) return;

    const channel = supabase
      .channel(`ticket-updates-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests',
          filter: `id=eq.${ticketId}`,
        },
        () => {
          fetchTicket();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, isAuthenticated]);

  useEffect(() => {
    if (role !== "developer" || !isAuthenticated || !userId || !ticketId) return;

    const checkApplicationStatus = async () => {
      try {
        const { data: matchData, error: matchError } = await supabase
          .from('help_request_matches')
          .select('status')
          .eq('request_id', ticketId)
          .eq('developer_id', userId)
          .maybeSingle();

        if (matchError) return;

        if (matchData) {
          setHasApplied(true);
          setApplicationStatus(matchData.status);
        } else {
          setHasApplied(false);
          setApplicationStatus(null);
        }
      } catch {
        // silently ignore
      }
    };

    checkApplicationStatus();
  }, [role, isAuthenticated, userId, ticketId]);

  const fetchTicket = async () => {
    if (!ticketId) {
      setError('No ticket ID provided');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', ticketId)
        .maybeSingle();

      if (error || !data) {
        setError(error?.message || 'Ticket not found');
        setIsLoading(false);
        return;
      }

      setTicket(data as HelpRequest);
    } catch {
      setError('Failed to load ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestTicketData = fetchTicket;

  // Show rating modal when a client's ticket is resolved and they haven't rated yet
  useEffect(() => {
    if (
      ticket?.status === 'resolved' &&
      role === 'client' &&
      ticket.selected_developer_id &&
      !hasRated &&
      !showRatingModal
    ) {
      setShowRatingModal(true);
    }
  }, [ticket?.status, role, ticket?.selected_developer_id, hasRated]);

  const shortTicketId = ticket?.id ? `HELP-${ticket.id.substring(0, 8)}` : "Unknown ID";

  const formatDate = (dateString?: string) => (dateString ? new Date(dateString).toLocaleString() : 'N/A');

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to apply for this ticket');
      navigate('/login', { state: { returnTo: `/tickets/${ticketId}` } });
      return;
    }
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = async () => {
    setShowApplicationModal(false);
    setHasApplied(true);
    setApplicationStatus('pending');
    toast.success('Your application has been submitted successfully!');

    if (isAuthenticated && userId && ticketId) {
      const { data } = await supabase
        .from('help_request_matches')
        .select('status')
        .eq('request_id', ticketId)
        .eq('developer_id', userId)
        .maybeSingle();
      if (data) {
        setApplicationStatus(data.status);
      }
    }
  };

  const handleSubmitQA = () => { setShowQADialog(true); };

  const handleQASubmitted = async () => {
    setShowQADialog(false);
    toast.success('QA submitted successfully');
    fetchLatestTicketData();
  };

  const handleApplicationAccepted = () => {
    fetchLatestTicketData();
    toast.success('Developer application accepted. The ticket is now in progress.');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold">Error Loading Ticket</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold">Ticket not found</h1>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <TicketHeader
          onBack={() => navigate(-1)}
          shortTicketId={shortTicketId}
          ticket={ticket}
        />
        <TicketStatusPanel ticket={ticket} />
        {ticket.status === 'in_progress' && ticket.in_progress_at && ticket.estimated_duration && (
          <div className="mt-4">
            <DeadlineTracker
              inProgressAt={ticket.in_progress_at}
              estimatedHours={ticket.estimated_duration}
            />
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <TicketDetails ticket={{
              ...ticket,
              technical_area: ticket.technical_area || [],
            }} userRole={role} />

            <CommentsSection
              visible={true}
              ticket={ticket}
              ticketId={ticket.id}
              userId={userId || ""}
              role={role}
            />

            <HistorySection ticketId={ticket.id} ticket={ticket} />
          </div>

          <div className="space-y-6">
            {role === "client" && ticketId && applications?.length > 0 && (
              <DeveloperApplicationsPanel
                applications={applications}
                ticketId={ticketId}
                clientId={userId || ""}
                isLoading={isLoadingApplications}
                onApplicationUpdate={() => {
                  fetchApplications();
                  fetchLatestTicketData();
                }}
                onOpenChat={(developerId, developerName) =>
                  navigate(`/chat/${ticketId}?with=${developerId}&name=${developerName || 'Developer'}`)}
              />
            )}
            {/* Kickoff panels: shown when ticket is in_progress */}
            {ticket.status === 'in_progress' && role === 'developer' && ticket.selected_developer_id === userId && (
              <KickoffQuestionsPanel
                ticketId={ticket.id}
                ticketTitle={ticket.title || ''}
                developerId={userId || ''}
                clientId={ticket.client_id}
              />
            )}

            {ticket.status === 'in_progress' && role === 'client' && ticket.selected_developer_id && (
              <ClientActionRequired
                ticketId={ticket.id}
                ticketTitle={ticket.title || ''}
                clientId={userId || ''}
                developerId={ticket.selected_developer_id}
              />
            )}

            {/* Secure notes */}
            {ticket.status === 'in_progress' && role === 'client' && ticket.selected_developer_id && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSecureNoteComposer(true)}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Share a secure note with the developer
                </button>
              </div>
            )}

            {ticket.status === 'in_progress' && role === 'developer' && ticket.client_id && (
              <SecureNoteViewer
                ticketId={ticket.id}
                recipientId={userId || ''}
                senderId={ticket.client_id}
              />
            )}

            <ClientEditSection
              visible={role === "client"}
              status={ticket.status}
              ticket={ticket}
              onTicketUpdated={setTicket}
              canSubmitQA={false}
              onSubmitQA={handleSubmitQA}
              formatDate={formatDate}
            />

            {(ticket.status === 'in_progress' ||
              ticket.status === 'ready_for_client_qa' ||
              ticket.status === 'reopened') &&
              (role === 'developer' || role === 'client') ? (
              <StatusTransitionDropdown
                ticketId={ticketId!}
                currentStatus={ticket.status}
                userRole={role}
                onStatusChange={async () => {
                  await fetchTicket();
                  await fetchApplications();
                }}
              />
            ) : (
              <TicketActionsPanel
                role={role}
                ticket={ticket}
                ticketId={ticketId}
                userId={userId || ""}
                applicationStatus={applicationStatus}
                hasApplied={hasApplied}
                onApply={handleApplyClick}
                fetchLatestTicketData={fetchLatestTicketData}
              />
            )}
          </div>
        </div>
      </div>

      <HelpRequestHistoryDialog
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        requestId={ticketId || ''}
        requestTitle={ticket?.title || ''}
      />
      <DeveloperQADialog
        isOpen={showQADialog}
        onClose={() => setShowQADialog(false)}
        requestId={ticketId || ''}
        requestTitle={ticket?.title || ''}
        onQASubmitted={handleQASubmitted}
      />
      {showApplicationModal && (
        <DeveloperApplicationModal
          isOpen={showApplicationModal}
          onOpenChange={setShowApplicationModal}
          requestId={ticketId}
          userId={userId}
          onSuccess={handleApplicationSuccess}
        />
      )}
      {showSecureNoteComposer && ticket?.selected_developer_id && (
        <SecureNoteComposer
          ticketId={ticket.id}
          ticketTitle={ticket.title || ''}
          senderId={userId || ''}
          recipientId={ticket.selected_developer_id}
          open={showSecureNoteComposer}
          onOpenChange={setShowSecureNoteComposer}
        />
      )}

      {showRatingModal && ticket?.selected_developer_id && (
        <PostSessionRatingModal
          isOpen={showRatingModal}
          ticketId={ticket.id}
          ticketTitle={ticket.title || ''}
          clientId={userId || ''}
          developerId={ticket.selected_developer_id}
          onClose={() => {
            setShowRatingModal(false);
            setHasRated(true);
          }}
        />
      )}
    </Layout>
  );
};

export default TicketDetailPage;
