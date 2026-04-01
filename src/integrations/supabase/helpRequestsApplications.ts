import { supabase } from './client';
import { MATCH_STATUSES } from '../../utils/constants/statusConstants';
import { toast } from 'sonner';
import { DeveloperProfile } from '../../types/helpRequest';
import { isDeveloperProfile, safelyGetProperty } from '../../utils/typeGuards';
import { sendEmailNotification, createNotification } from './notifications';

// Export valid match statuses for use in other components
export const VALID_MATCH_STATUSES = MATCH_STATUSES;

/**
 * Update the status of a help request application
 */
export const updateApplicationStatus = async (
  applicationId: string, 
  status: 'approved' | 'rejected',
  userId: string
) => {
  try {
    let statusValue = status === 'approved' 
      ? MATCH_STATUSES.APPROVED_BY_CLIENT 
      : MATCH_STATUSES.REJECTED_BY_CLIENT;
    
    const { data, error } = await supabase
      .from('help_request_matches')
      .update({
        status: statusValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select();

    if (error) {
      console.error('[helpRequestsApplications] Error updating application status:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // If approved, reject all other applications and notify the developer
    if (status === 'approved' && data && data[0]) {
      const requestId = data[0].request_id;
      const developerId = data[0].developer_id;

      await supabase
        .from('help_request_matches')
        .update({
          status: MATCH_STATUSES.REJECTED_BY_CLIENT,
          updated_at: new Date().toISOString()
        })
        .eq('request_id', requestId)
        .neq('id', applicationId);

      // Fire email notification to the developer (non-blocking)
      (async () => {
        try {
          const { data: request } = await supabase
            .from('help_requests')
            .select('title, client_id')
            .eq('id', requestId)
            .single();

          const { data: clientProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', userId)
            .single();

          if (developerId && request?.title) {
            await sendEmailNotification({
              type: 'application_approved',
              recipient_user_id: developerId,
              data: {
                ticket_title: request.title,
                ticket_id: requestId,
                client_name: clientProfile?.name || 'A client',
              },
            });
          }
        } catch (e) {
          console.error('[helpRequestsApplications] Email notification error (non-fatal):', e);
        }
      })();

      // Create in-app notifications for both parties (non-blocking)
      (async () => {
        try {
          const { data: notifRequest } = await supabase
            .from('help_requests')
            .select('title, client_id')
            .eq('id', requestId)
            .single();

          if (notifRequest && developerId) {
            await createNotification({
              user_id: developerId,
              related_entity_id: requestId,
              entity_type: 'help_request',
              title: 'Application Accepted',
              message: `Your application for "${notifRequest.title}" was accepted. You can now get started.`,
              notification_type: 'application_approved',
              action_data: { request_id: requestId, request_title: notifRequest.title },
            });

            await createNotification({
              user_id: notifRequest.client_id,
              related_entity_id: requestId,
              entity_type: 'help_request',
              title: 'Ticket Now In Progress',
              message: `A developer has been accepted for "${notifRequest.title}" and work is beginning.`,
              notification_type: 'ticket_accepted',
              action_data: { request_id: requestId, request_title: notifRequest.title },
            });
          }
        } catch (e) {
          console.error('[helpRequestsApplications] In-app notification error (non-fatal):', e);
        }
      })();
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('[helpRequestsApplications] Error in updateApplicationStatus:', err);
    return {
      success: false,
      error: 'Failed to update application status',
    };
  }
};

/**
 * Fetch pending developer applications for a specific help request
 */
export const getDeveloperApplicationsForRequest = async (requestId: string) => {
  try {
    const { data, error } = await supabase
      .from('help_request_matches')
      .select(`
        *,
        profiles:developer_id (id, name, image, description, location),
        developer_profiles:developer_id (id, skills, experience, hourly_rate)
      `)
      .eq('request_id', requestId);
      
    if (error) {
      console.error('[helpRequestsApplications] Error fetching developer applications:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Process and normalize the data to handle potentially missing profile info
    const processedData = (data || []).map(app => {
      // Handle potentially malformed profiles data
      let safeProfiles = app.profiles;
      
      if (!safeProfiles || typeof safeProfiles !== 'object') {
        safeProfiles = { 
          id: app.developer_id, 
          name: 'Unknown Developer',
          image: null,
          description: '',
          location: ''
        };
      } else if (!safeProfiles.description) {
        safeProfiles.description = '';
      } else if (!safeProfiles.location) {
        safeProfiles.location = '';
      }
      
      // Handle potentially malformed developer_profiles data
      let safeDeveloperProfiles: DeveloperProfile;
      
      if (isDeveloperProfile(app.developer_profiles)) {
        safeDeveloperProfiles = {
          id: app.developer_id,
          skills: Array.isArray(app.developer_profiles.skills) ? app.developer_profiles.skills : [],
          experience: typeof app.developer_profiles.experience === 'string' ? app.developer_profiles.experience : '',
          hourly_rate: typeof app.developer_profiles.hourly_rate === 'number' ? app.developer_profiles.hourly_rate : 0
        };
      } else {
        safeDeveloperProfiles = {
          id: app.developer_id,
          skills: [],
          experience: '',
          hourly_rate: 0
        };
      }
      
      return {
        ...app,
        profiles: safeProfiles,
        developer_profiles: safeDeveloperProfiles
      };
    });

    return {
      success: true,
      data: processedData
    };
  } catch (err) {
    console.error('[helpRequestsApplications] Error in getDeveloperApplicationsForRequest:', err);
    return {
      success: false,
      error: 'Failed to fetch developer applications'
    };
  }
};

/**
 * Submit a developer application for a help request
 */
export const submitDeveloperApplication = async (
  requestId: string,
  developerId: string,
  proposedMessage: string,
  proposedRate?: number,
  proposedDuration?: number
) => {
  try {
    // Check if the developer has already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('help_request_matches')
      .select('id')
      .eq('request_id', requestId)
      .eq('developer_id', developerId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[helpRequestsApplications] Error checking for existing application:', checkError);
      return {
        success: false,
        error: checkError.message
      };
    }

    if (existingApplication) {
      return {
        success: false,
        error: 'You have already applied to this help request'
      };
    }

    // Create the application
    const { data: newApplication, error: createError } = await supabase
      .from('help_request_matches')
      .insert({
        request_id: requestId,
        developer_id: developerId,
        proposed_message: proposedMessage,
        proposed_rate: proposedRate,
        proposed_duration: proposedDuration,
        status: MATCH_STATUSES.PENDING
      })
      .select();

    if (createError) {
      console.error('[helpRequestsApplications] Error creating application:', createError);
      return {
        success: false,
        error: createError.message
      };
    }

    // Update the help request status to awaiting_client_approval
    const { error: updateError } = await supabase
      .from('help_requests')
      .update({
        status: 'awaiting_client_approval',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('[helpRequestsApplications] Error updating help request status:', updateError);
      // Continue even if this fails, as the application was created
    }

    // Fire email notification to the client (non-blocking)
    (async () => {
      try {
        const { data: request } = await supabase
          .from('help_requests')
          .select('client_id, title')
          .eq('id', requestId)
          .single();

        const { data: devProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', developerId)
          .single();

        if (request?.client_id && request?.title) {
          await sendEmailNotification({
            type: 'new_application',
            recipient_user_id: request.client_id,
            data: {
              ticket_title: request.title,
              ticket_id: requestId,
              developer_name: devProfile?.name || 'A developer',
            },
          });

          await createNotification({
            user_id: request.client_id,
            related_entity_id: requestId,
            entity_type: 'help_request',
            title: 'New Developer Application',
            message: `${devProfile?.name || 'A developer'} has applied to help with "${request.title}".`,
            notification_type: 'new_application',
            action_data: {
              request_id: requestId,
              developer_name: devProfile?.name || 'A developer',
              request_title: request.title,
            },
          });
        }
      } catch (e) {
        console.error('[helpRequestsApplications] Email notification error (non-fatal):', e);
      }
    })();

    return {
      success: true,
      data: newApplication?.[0]
    };
  } catch (err) {
    console.error('[helpRequestsApplications] Error in submitDeveloperApplication:', err);
    return {
      success: false,
      error: 'Failed to submit application'
    };
  }
};
