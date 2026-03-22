
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import LoginPrompt from '../components/dashboard/LoginPrompt';
import { useAuth } from '../contexts/auth';
import { HelpRequest } from '../types/helpRequest';
import TicketSection from '../components/dashboard/TicketSection';
import LoadingState from '../components/dashboard/LoadingState';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';

type ClientTicketCategories = {
  activeTickets: HelpRequest[];
  inProgressTickets: HelpRequest[];
  completedTickets: HelpRequest[];
  cancelledTickets: HelpRequest[];
};

const categorizeTickets = (tickets: HelpRequest[]): ClientTicketCategories => ({
  activeTickets: tickets.filter(t => t.status === 'open' || t.status === 'awaiting_client_approval'),
  inProgressTickets: tickets.filter(t => t.status === 'in_progress'),
  completedTickets: tickets.filter(t => t.status === 'resolved'),
  cancelledTickets: tickets.filter(t => t.status === 'cancelled_by_client'),
});

const tabTriggerClass =
  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2 font-medium';

const ClientDashboard: React.FC = () => {
  const { isAuthenticated, userId } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTickets = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data as HelpRequest[]) || []);
    } catch {
      toast.error('Failed to load tickets. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchTickets();
    } else if (!isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, fetchTickets]);

  const clientTickets = categorizeTickets(tickets);

  return (
    <Layout>
      {/* Client-specific header banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Help Requests</h1>
            <p className="text-blue-100">Track and manage all your support tickets.</p>
          </div>
          <Button
            onClick={() => navigate('/client/help')}
            className="bg-white text-indigo-900 hover:bg-blue-50 font-medium w-fit"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      <Separator className="my-0" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
        {!isAuthenticated ? (
          <LoginPrompt />
        ) : isLoading ? (
          <LoadingState />
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <TabsList className="flex space-x-1 p-1 bg-secondary rounded-md">
                <TabsTrigger value="active" className={tabTriggerClass}>
                  Active ({clientTickets.activeTickets.length})
                </TabsTrigger>
                <TabsTrigger value="inProgress" className={tabTriggerClass}>
                  In Progress ({clientTickets.inProgressTickets.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className={tabTriggerClass}>
                  Completed ({clientTickets.completedTickets.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className={tabTriggerClass}>
                  Cancelled ({clientTickets.cancelledTickets.length})
                </TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTickets(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <TabsContent value="active">
              <TicketSection
                title="Active Tickets"
                tickets={clientTickets.activeTickets}
                emptyMessage="No active tickets. Submit a new request to get started."
                onClaimTicket={() => {}}
                userId={userId}
                isAuthenticated={isAuthenticated}
                viewMode="list"
                onRefresh={() => fetchTickets(true)}
              />
            </TabsContent>

            <TabsContent value="inProgress">
              <TicketSection
                title="In Progress Tickets"
                tickets={clientTickets.inProgressTickets}
                emptyMessage="No tickets in progress."
                onClaimTicket={() => {}}
                userId={userId}
                isAuthenticated={isAuthenticated}
                viewMode="list"
                onRefresh={() => fetchTickets(true)}
              />
            </TabsContent>

            <TabsContent value="completed">
              <TicketSection
                title="Completed Tickets"
                tickets={clientTickets.completedTickets}
                emptyMessage="No completed tickets yet."
                onClaimTicket={() => {}}
                userId={userId}
                isAuthenticated={isAuthenticated}
                viewMode="list"
                onRefresh={() => fetchTickets(true)}
              />
            </TabsContent>

            <TabsContent value="cancelled">
              <TicketSection
                title="Cancelled Tickets"
                tickets={clientTickets.cancelledTickets}
                emptyMessage="No cancelled tickets."
                onClaimTicket={() => {}}
                userId={userId}
                isAuthenticated={isAuthenticated}
                viewMode="list"
                onRefresh={() => fetchTickets(true)}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default ClientDashboard;
