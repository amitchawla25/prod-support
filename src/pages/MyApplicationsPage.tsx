
import React, { useEffect, useCallback, useState } from 'react';
import Layout from '../components/Layout';
import DashboardBanner from '../components/dashboard/DashboardBanner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import LoadingState from '../components/dashboard/LoadingState';
import EmptyTicketState from '../components/dashboard/EmptyTicketState';
import TicketSummary from '../components/dashboard/TicketSummary';
import TicketListContainer from '../components/dashboard/TicketListContainer';
import { useDeveloperDashboard } from '../hooks/dashboard/useDeveloperDashboard';
import { useAuth } from '../contexts/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ProfileErrorState from '../components/profile/ProfileErrorState';

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const { userId, userType, isAuthenticated } = useAuth();
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [hasLoadingTimedOut, setHasLoadingTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const {
    myApplications,
    isLoading,
    isLoadingApplications,
    hasError,
    hasApplicationError,
    dataSource,
    handleClaimTicket,
    fetchMyApplications
  } = useDeveloperDashboard({});
  
  const fetchApplications = useCallback(() => {
    if (userId && isAuthenticated && fetchMyApplications) {
      console.log('MyApplicationsPage: Fetching applications');
      fetchMyApplications(isAuthenticated, userId)
        .catch(error => {
          console.error('Error fetching applications:', error);
          toast.error('Failed to load your applications');
        })
        .finally(() => {
          setIsLoadingPage(false);
        });
    } else {
      setIsLoadingPage(false);
    }
  }, [userId, isAuthenticated, fetchMyApplications]);

  const handleRetry = useCallback(() => {
    setIsLoadingPage(true);
    setHasLoadingTimedOut(false);
    setRetryCount(prev => prev + 1);
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (isAuthenticated && userType !== 'developer') {
      navigate('/client-dashboard');
      return;
    }
    
    fetchApplications();
    
    const timeoutId = setTimeout(() => {
      // Always mark as timed out after 10s. The render logic decides
      // whether to show an error based on whether we're still loading.
      setHasLoadingTimedOut(true);
      setIsLoadingPage(false);
      console.log('MyApplicationsPage: Loading timeout reached after 10s');
    }, 10000);
    
    return () => clearTimeout(timeoutId);
  }, [fetchApplications, isAuthenticated, userType, navigate, retryCount]);
  
  useEffect(() => {
    if (!isLoading && !isLoadingApplications && isLoadingPage) {
      setIsLoadingPage(false);
    }
  }, [isLoading, isLoadingApplications, isLoadingPage]);
  
  useEffect(() => {
    console.log('MyApplicationsPage loading state:', { 
      isLoadingPage, 
      isLoading, 
      isLoadingApplications,
      hasError,
      hasApplicationError,
      hasLoadingTimedOut,
      applicationsCount: (myApplications || [])?.length || 0
    });
  }, [isLoadingPage, isLoading, isLoadingApplications, hasError, hasApplicationError, hasLoadingTimedOut, myApplications]);

  const handleForceLogout = useCallback(() => {
    import('../utils/recovery').then(recovery => {
      recovery.performEmergencyLogout();
      toast.info('Performing emergency logout to resolve issues...');
    });
  }, []);

  // Show error state for actual errors
  // For timeouts, only show error if we're still stuck loading (not if data arrived before the timeout)
  const isStillLoading = isLoadingPage || isLoading || isLoadingApplications;
  if ((hasError || hasApplicationError) || (hasLoadingTimedOut && isStillLoading)) {
    return (
      <Layout>
        <DashboardBanner />
        <ProfileErrorState
          title="Unable to load your applications"
          message="We're having trouble loading your applications. Please try again or log out and back in to resolve this issue."
          onForceLogout={handleForceLogout}
          onRetry={handleRetry}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <DashboardBanner />
      
      <div className="container mx-auto py-8 px-4">
        <DashboardHeader 
          showFilters={false}
          setShowFilters={() => {}} 
          onRefresh={fetchApplications}
          title="My Applications"
          description="Manage and track your approved tickets"
          hideFilterButton={true}
        />
        
        {isLoadingPage || isLoading || isLoadingApplications ? (
          <LoadingState 
            message="Loading your applications..." 
            description="We're retrieving all your approved applications from the database."
          />
        ) : (
          <div>
            <TicketSummary 
              filteredCount={(myApplications || [])?.length || 0} 
              totalCount={(myApplications || [])?.length || 0} 
              dataSource="database"
              categoryTitle="My Approved Tickets"
              isApplication={true}
            />
            
            {myApplications && myApplications.length > 0 ? (
              <TicketListContainer
                filteredTickets={myApplications}
                totalTickets={myApplications.length}
                onClaimTicket={handleClaimTicket}
                userId={userId}
                isAuthenticated={isAuthenticated}
                onRefresh={fetchApplications}
                isApplication={true}
              />
            ) : (
              <EmptyTicketState 
                tickets={[]}
                isAuthenticated={isAuthenticated}
                onRefresh={fetchApplications}
                dataSource={dataSource}
                customMessage="You don't have any approved tickets yet. Apply to available tickets and wait for client approval to see them here."
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyApplicationsPage;
