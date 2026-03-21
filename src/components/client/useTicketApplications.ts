import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

export interface DeveloperApplication {
  id: string;
  status: string;
  developer_id: string;
  request_id: string;
  proposed_message?: string | null;
  proposed_rate?: number | null;
  proposed_duration?: number | null;
  created_at: string;
  developer?: {
    name?: string;
    image?: string | null;
    location?: string | null;
  };
}

export const useTicketApplications = (ticketId: string) => {
  const [applications, setApplications] = useState<DeveloperApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!ticketId) return;
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('help_request_matches')
        .select(`
          id,
          status,
          developer_id,
          request_id,
          proposed_message,
          proposed_rate,
          proposed_duration,
          created_at,
          profiles:developer_id (id, name, image, location)
        `)
        .eq('request_id', ticketId)
        .order('created_at', { ascending: false });

      if (fetchError) throw new Error(fetchError.message);

      const mapped: DeveloperApplication[] = (data || []).map((app: any) => ({
        id: app.id,
        status: app.status,
        developer_id: app.developer_id,
        request_id: app.request_id,
        proposed_message: app.proposed_message,
        proposed_rate: app.proposed_rate,
        proposed_duration: app.proposed_duration,
        created_at: app.created_at,
        developer: app.profiles
          ? {
              name: app.profiles.name,
              image: app.profiles.image,
              location: app.profiles.location,
            }
          : undefined,
      }));

      setApplications(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load applications';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (!ticketId) return;

    const channel = supabase
      .channel(`client-applications-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_request_matches',
          filter: `request_id=eq.${ticketId}`,
        },
        () => fetchApplications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, fetchApplications]);

  const approveApplication = async (applicationId: string): Promise<void> => {
    const application = applications.find(a => a.id === applicationId);
    if (!application) {
      toast.error('Application not found');
      return;
    }

    toast.loading('Approving application...');

    const { error: approveError } = await supabase
      .from('help_request_matches')
      .update({ status: 'approved' })
      .eq('id', applicationId);

    if (approveError) {
      toast.dismiss();
      toast.error(`Failed to approve application: ${approveError.message}`);
      throw approveError;
    }

    const { error: ticketError } = await supabase
      .from('help_requests')
      .update({ status: 'in_progress', selected_developer_id: application.developer_id })
      .eq('id', ticketId);

    if (ticketError) {
      toast.dismiss();
      toast.error(`Failed to update ticket: ${ticketError.message}`);
      throw ticketError;
    }

    // Reject all other pending applications
    await supabase
      .from('help_request_matches')
      .update({ status: 'rejected' })
      .eq('request_id', ticketId)
      .neq('id', applicationId)
      .eq('status', 'pending');

    toast.dismiss();
    toast.success('Developer approved! Ticket is now in progress.');
    await fetchApplications();
  };

  const rejectApplication = async (applicationId: string, _reason?: string): Promise<void> => {
    toast.loading('Declining application...');

    const { error: rejectError } = await supabase
      .from('help_request_matches')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    if (rejectError) {
      toast.dismiss();
      toast.error(`Failed to decline application: ${rejectError.message}`);
      throw rejectError;
    }

    toast.dismiss();
    toast.success('Application declined.');
    await fetchApplications();
  };

  const pendingApplications = applications.filter(a => a.status === 'pending');

  return {
    applications,
    pendingApplications,
    isLoading,
    error,
    approveApplication,
    rejectApplication,
  };
};
