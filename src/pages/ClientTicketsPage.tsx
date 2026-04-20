
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/auth';
import { HelpRequest } from '../types/helpRequest';
import TicketFilters from '../components/tickets/TicketFilters';
import TicketList from '../components/tickets/TicketList';
import EmptyTicketsView from '../components/tickets/EmptyTicketsView';
import { useTicketFilters } from '../hooks/dashboard/useTicketFilters';
import TicketListContainer from '../components/dashboard/TicketListContainer';

const ClientTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { filterOptions, updateFilterOptions, resetFilters, getFilterLabelForStatus } = useTicketFilters(tickets);
  
  // Filter tickets based on the filter options
  const filteredTickets = tickets.filter(ticket => {
    if (filterOptions.status && filterOptions.status !== 'all' && ticket.status !== filterOptions.status) {
      return false;
    }
    
    if (filterOptions.urgency && filterOptions.urgency !== 'all' && ticket.urgency !== filterOptions.urgency) {
      return false;
    }
    
    if (filterOptions.technicalAreas && filterOptions.technicalAreas.length > 0) {
      if (!ticket.technical_area || !Array.isArray(ticket.technical_area)) {
        return false;
      }
      
      const hasMatchingArea = ticket.technical_area.some(area => 
        filterOptions.technicalAreas?.includes(area));
      
      if (!hasMatchingArea) {
        return false;
      }
    }
    
    return true;
  });

  // Fetch tickets function
  const fetchTickets = async () => {
    if (!isAuthenticated || !userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        return;
      }

      // Ensure type safety by explicitly casting to HelpRequest[]
      setTickets(data as HelpRequest[]);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [userId, isAuthenticated]);

  const handleNewRequest = () => {
    navigate('/client/help');
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Tickets</h1>
          <Button onClick={handleNewRequest} className="mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            New Help Request
          </Button>
        </div>

        <TicketFilters 
          filterOptions={filterOptions}
          updateFilterOptions={updateFilterOptions}
          resetFilters={resetFilters}
          getFilterLabelForStatus={getFilterLabelForStatus}
        />

        {isLoading ? (
          <div className="animate-pulse space-y-4 mt-6">
            <div className="h-14 bg-muted rounded"></div>
            <div className="h-14 bg-muted rounded"></div>
            <div className="h-14 bg-muted rounded"></div>
          </div>
        ) : filteredTickets.length > 0 ? (
          <TicketListContainer 
            filteredTickets={filteredTickets}
            totalTickets={tickets.length} 
            onClaimTicket={() => {}} 
            userId={userId}
            userType="client"
            isAuthenticated={isAuthenticated}
            onRefresh={fetchTickets}
          />
        ) : (
          <EmptyTicketsView 
            customMessage="You don't have any tickets yet. Create a new help request to get started!" 
            onCreateNew={handleNewRequest}
          />
        )}
      </div>
    </Layout>
  );
};

export default ClientTicketsPage;
