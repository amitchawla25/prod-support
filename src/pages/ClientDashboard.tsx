
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DashboardBanner from '../components/dashboard/DashboardBanner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { useDeveloperDashboard } from '../hooks/dashboard/useDeveloperDashboard';
import EmptyTicketState from '../components/dashboard/EmptyTicketState';
import LoginPrompt from '../components/dashboard/LoginPrompt';
import { useAuth } from '../contexts/auth';
import { HelpRequest } from '../types/helpRequest';
import TicketListContainer from '../components/dashboard/TicketListContainer';
import TicketSummary from '../components/dashboard/TicketSummary';
import TicketFiltersContainer from '../components/dashboard/TicketFiltersContainer';
import LoadingState from '../components/dashboard/LoadingState';
import TicketViewToggle from '../components/dashboard/TicketViewToggle';
import TicketSection from '../components/dashboard/TicketSection';

type ClientTicketCategories = {
  activeTickets: HelpRequest[];
  inProgressTickets: HelpRequest[];
  completedTickets: HelpRequest[];
  cancelledTickets: HelpRequest[];
};

// Type guard for ClientTicketCategories
const isClientCategories = (obj: any): obj is ClientTicketCategories => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'activeTickets' in obj &&
    'inProgressTickets' in obj &&
    'completedTickets' in obj &&
    'cancelledTickets' in obj
  );
};

const ClientDashboard: React.FC = () => {
  const { isAuthenticated, userType, userId } = useAuth();
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fix the call to useDeveloperDashboard by passing an empty object
  const {
    categorizedTickets,
    isLoading,
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets,
    hasError
  } = useDeveloperDashboard({});
  
  useEffect(() => {
    // Only show error message if we're still in error state after a delay
    // This prevents quick flashes of error messages during normal loading
    let errorTimeout: NodeJS.Timeout | null = null;
    
    if (hasError) {
      errorTimeout = setTimeout(() => {
        setShowErrorMessage(true);
      }, 3000); // Show error message after 3 seconds if still in error state
    } else {
      setShowErrorMessage(false);
    }
    
    return () => {
      if (errorTimeout) clearTimeout(errorTimeout);
    };
  }, [hasError]);
  
  const categorizeTickets = (tickets: HelpRequest[]): ClientTicketCategories => {
    const activeTickets = tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'awaiting_client_approval');
    const inProgressTickets = tickets.filter(ticket => ticket.status === 'in_progress');
    const completedTickets = tickets.filter(ticket => ticket.status === 'resolved');
    const cancelledTickets = tickets.filter(ticket => ticket.status === 'cancelled_by_client');

    return {
      activeTickets,
      inProgressTickets,
      completedTickets,
      cancelledTickets
    };
  };

  // Use the categorizedTickets from useDeveloperDashboard or categorize them manually
  const clientTickets = isClientCategories(categorizedTickets) 
    ? categorizedTickets 
    : categorizeTickets(Array.isArray(categorizedTickets) ? categorizedTickets : []);

  return (
    <Layout>
      <DashboardHeader 
        showFilters={showFilters} 
        setShowFilters={setShowFilters} 
        onRefresh={handleForceRefresh}
        title="Client Dashboard"
        description="View and manage your help requests."
      />
      <DashboardBanner />
      <Separator className="my-4" />
      
      {/* Main content area */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Authentication check */}
        {!isAuthenticated ? (
          <LoginPrompt />
        ) : (
          <>
            {/* Loading state */}
            {isLoading ? (
              <LoadingState />
            ) : (
              <>
                {/* Error message display */}
                {showErrorMessage && (
                  <div className="text-red-500 mb-4">
                    Failed to load help requests. Please try again later.
                  </div>
                )}
                
                {/* Ticket categories tabs */}
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="flex space-x-4 p-2 bg-secondary rounded-md">
                    <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2 font-medium">
                      Active ({clientTickets.activeTickets.length})
                    </TabsTrigger>
                    <TabsTrigger value="inProgress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2 font-medium">
                      In Progress ({clientTickets.inProgressTickets.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2 font-medium">
                      Completed ({clientTickets.completedTickets.length})
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2 font-medium">
                      Cancelled ({clientTickets.cancelledTickets.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Active tickets tab panel */}
                  <TabsContent value="active">
                    <TicketSection
                      title="Active Tickets"
                      tickets={clientTickets.activeTickets}
                      emptyMessage="No active tickets."
                      onClaimTicket={() => {}}
                      userId={userId}
                      isAuthenticated={isAuthenticated}
                      viewMode="list"
                      onRefresh={handleForceRefresh}
                    />
                  </TabsContent>

                  {/* In Progress tickets tab panel */}
                  <TabsContent value="inProgress">
                    <TicketSection
                      title="In Progress Tickets"
                      tickets={clientTickets.inProgressTickets}
                      emptyMessage="No tickets in progress."
                      onClaimTicket={() => {}}
                      userId={userId}
                      isAuthenticated={isAuthenticated}
                      viewMode="list"
                      onRefresh={handleForceRefresh}
                    />
                  </TabsContent>

                  {/* Completed tickets tab panel */}
                  <TabsContent value="completed">
                    <TicketSection
                      title="Completed Tickets"
                      tickets={clientTickets.completedTickets}
                      emptyMessage="No completed tickets."
                      onClaimTicket={() => {}}
                      userId={userId}
                      isAuthenticated={isAuthenticated}
                      viewMode="list"
                      onRefresh={handleForceRefresh}
                    />
                  </TabsContent>

                  {/* Cancelled tickets tab panel */}
                  <TabsContent value="cancelled">
                    <TicketSection
                      title="Cancelled Tickets"
                      tickets={clientTickets.cancelledTickets}
                      emptyMessage="No cancelled tickets."
                      onClaimTicket={() => {}}
                      userId={userId}
                      isAuthenticated={isAuthenticated}
                      viewMode="list"
                      onRefresh={handleForceRefresh}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ClientDashboard;
