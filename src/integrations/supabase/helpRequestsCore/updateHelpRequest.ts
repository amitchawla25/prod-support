import { supabase } from '../client';
import { HelpRequest } from '../../../types/helpRequest';
import { isLocalId, isValidUUID, getLocalHelpRequests } from './utils';
import { toast } from 'sonner';

export const updateHelpRequestStatus = async (requestId: string, newStatus: string, userId: string | null, options: {
  notes?: string;
  cancellationReason?: string;
  developerQANotes?: string;
  clientFeedback?: string;
  rating?: number;
} = {}) => {
  console.log('[updateHelpRequestStatus] Updating status to:', newStatus);
  
  if (!userId) {
    console.error('[updateHelpRequestStatus] No userId provided');
    return { success: false, error: 'No user ID provided' };
  }
  
  try {
    // For valid UUIDs, update in Supabase
    if (isValidUUID(requestId)) {
      // First, get the current help request to check if it exists and validate the user
      const { data, error } = await supabase
        .from('help_requests')
        .select('id, status, client_id, selected_developer_id')
        .eq('id', requestId);
      
      if (error) {
        console.error('[updateHelpRequestStatus] Error fetching help request:', error.message);
        return { success: false, error: error.message };
      }
      
      // Add null guard for data
      if (!data || data.length === 0) {
        console.error('[updateHelpRequestStatus] Help request not found');
        return { success: false, error: 'Help request not found' };
      }
      
      // Add null guard and type check for currentReqData
      const currentReqData = data[0];
      if (!currentReqData) {
        console.error('[updateHelpRequestStatus] Current request data is null');
        return { success: false, error: 'Error fetching help request data' };
      }
      
      // Check if currentReqData is an error object
      if ('code' in currentReqData) {
        console.error('[updateHelpRequestStatus] Error object in currentReqData:', currentReqData);
        return { success: false, error: 'Error parsing help request data' };
      }
      
      // Validate the user is either the client or the assigned developer
      const isClient = 'client_id' in currentReqData && currentReqData.client_id === userId;
      const isDeveloper = 'selected_developer_id' in currentReqData ? currentReqData.selected_developer_id === userId : false;
      
      if (!isClient && !isDeveloper) {
        console.error('[updateHelpRequestStatus] User is not authorized to update this request');
        return { 
          success: false, 
          error: 'You are not authorized to update this help request',
          statusCode: 403
        };
      }
      
      // Prepare the update payload
      const updatePayload: Record<string, any> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      // Add optional fields if provided
      if (options.notes) {
        // Instead of updating a non-existent 'notes' field, use description or another existing field
        // updatePayload.notes = options.notes;
        // Let's use developer_qa_notes since it's a similar concept:
        updatePayload.developer_qa_notes = options.notes;
      }
      
      if (options.cancellationReason) {
        updatePayload.cancellation_reason = options.cancellationReason;
      }
      
      if (options.developerQANotes) {
        updatePayload.developer_qa_notes = options.developerQANotes;
      }
      
      if (options.clientFeedback) {
        updatePayload.client_feedback = options.clientFeedback;
      }
      
      if (options.rating) {
        updatePayload.rating = options.rating;
      }
      
      // Update the help request
      const { data: updatedData, error: updateError } = await supabase
        .from('help_requests')
        .update(updatePayload)
        .eq('id', requestId)
        .select();
      
      if (updateError) {
        console.error('[updateHelpRequestStatus] Error updating help request:', updateError.message);
        return { success: false, error: updateError.message };
      }
      
      // Check if updatedData is valid
      if (!updatedData || updatedData.length === 0) {
        console.error('[updateHelpRequestStatus] No data returned after update');
        return { success: false, error: 'Failed to update help request' };
      }
      
      console.log('[updateHelpRequestStatus] Successfully updated help request status');
      return { success: true, data: updatedData[0] };
    }
    
    // For local IDs, update in localStorage
    if (isLocalId(requestId)) {
      console.log('[updateHelpRequestStatus] Updating local storage help request');
      
      const localHelpRequests = getLocalHelpRequests();
      const requestIndex = localHelpRequests.findIndex(req => req.id === requestId);
      
      if (requestIndex === -1) {
        return { success: false, error: 'Help request not found in local storage' };
      }
      
      const updatedRequest = {
        ...localHelpRequests[requestIndex],
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      // Add optional fields if provided
      if (options.notes) {
        // Instead of updating a non-existent 'notes' field 
        // updatedRequest.notes = options.notes;
        // Use developer_qa_notes instead
        updatedRequest.developer_qa_notes = options.notes;
      }
      
      if (options.cancellationReason) {
        updatedRequest.cancellation_reason = options.cancellationReason;
      }
      
      localHelpRequests[requestIndex] = updatedRequest;
      localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
      
      return { success: true, data: updatedRequest };
    }
    
    return { success: false, error: 'Invalid help request ID format' };
    
  } catch (error) {
    console.error('[updateHelpRequestStatus] Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error updating help request status' 
    };
  }
};

export const updateHelpRequest = async (
  requestId: string, 
  updates: Partial<HelpRequest>, 
  userId: string | null
) => {
  if (!userId) {
    return { success: false, error: 'No user ID provided' };
  }
  
  try {
    // For valid UUIDs, update in Supabase
    if (isValidUUID(requestId)) {
      // First, get the current help request to check if the user is the owner
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', requestId);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Add null guard for data
      if (!data || data.length === 0) {
        return { success: false, error: 'Help request not found' };
      }
      
      // Check if data[0] is an error object
      const currentRequest = data[0];
      if (!currentRequest || 'code' in currentRequest) {
        console.warn('updateHelpRequest: invalid currentRequest', currentRequest);
        return { success: false, error: 'Invalid help request data' };
      }
      
      // Now it's safe to access properties
      // Validate the user is the client who created the request
      if (currentRequest.client_id !== userId) {
        return { 
          success: false, 
          error: 'You are not authorized to update this help request',
          statusCode: 403
        };
      }
      
      // Ensure we're not changing certain fields
      const safeUpdates: Record<string, any> = { ...updates };
      delete safeUpdates.id;
      delete safeUpdates.client_id;
      delete safeUpdates.created_at;
      
      // Set the updated_at timestamp
      safeUpdates.updated_at = new Date().toISOString();
      
      // Update the help request
      const { data: updatedData, error: updateError } = await supabase
        .from('help_requests')
        .update(safeUpdates)
        .eq('id', requestId)
        .select();
      
      if (updateError) {
        return { success: false, error: updateError.message };
      }
      
      // Add null guard for result
      const result = updatedData && updatedData.length > 0 ? updatedData[0] : null;
      if (!result) {
        return { success: false, error: 'Failed to update help request' };
      }

      // Check if result is an error object
      if ('code' in result) {
        console.warn('updateHelpRequest: result error', result);
        return { success: false, error: 'Error processing update response' };
      }
      
      // Get previous status if result is valid
      let prevStatus: string | null = null;
      if ('status' in result) {
        prevStatus = result.status;
      } else {
        console.warn('updateHelpRequest: result missing status', result);
      }
      
      // Log the status change if applicable
      if (prevStatus && updates.status && prevStatus !== updates.status) {
        console.log(`[updateHelpRequest] Status changed from ${prevStatus} to ${updates.status}`);
        
        // Here you might want to log the status change in a separate table or notify users
      }
      
      return { success: true, data: result };
    }
    
    // For local IDs, update in localStorage
    if (isLocalId(requestId)) {
      const localHelpRequests = getLocalHelpRequests();
      const requestIndex = localHelpRequests.findIndex(req => req.id === requestId);
      
      if (requestIndex === -1) {
        return { success: false, error: 'Help request not found in local storage' };
      }
      
      // Validate the user is the client who created the request
      if (localHelpRequests[requestIndex].client_id !== userId) {
        return { 
          success: false, 
          error: 'You are not authorized to update this help request' 
        };
      }
      
      // Ensure we're not changing certain fields
      const safeUpdates: Record<string, any> = { ...updates };
      delete safeUpdates.id;
      delete safeUpdates.client_id;
      delete safeUpdates.created_at;
      
      // Set the updated_at timestamp
      safeUpdates.updated_at = new Date().toISOString();
      
      const updatedRequest = {
        ...localHelpRequests[requestIndex],
        ...safeUpdates
      };
      
      localHelpRequests[requestIndex] = updatedRequest;
      localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
      
      return { success: true, data: updatedRequest };
    }
    
    return { success: false, error: 'Invalid help request ID format' };
    
  } catch (error) {
    console.error('[updateHelpRequest] Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error updating help request' 
    };
  }
};

// Helper function to assign a developer to a help request
export const assignDeveloperToRequest = async (
  requestId: string, 
  developerId: string, 
  userId: string | null
) => {
  // Validate inputs
  if (!requestId || !developerId || !userId) {
    return { success: false, error: 'Missing required parameters' };
  }
  
  try {
    // Only handle Supabase UUID case
    if (isValidUUID(requestId)) {
      // First, get the current help request to check if the user is authorized
      const { data, error } = await supabase
        .from('help_requests')
        .select('client_id, status')
        .eq('id', requestId)
        .single();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Check if data is an error object
      if (!data || 'code' in data) {
        console.error('assignDeveloperToRequest: invalid response data', data);
        return { success: false, error: 'Invalid help request data' };
      }
      
      // Ensure the user is the client who created the request
      if (data.client_id !== userId) {
        return { 
          success: false, 
          error: 'You are not authorized to assign developers to this help request' 
        };
      }
      
      // Update the help request with the developer ID and change status
      const { data: updatedData, error: updateError } = await supabase
        .from('help_requests')
        .update({
          selected_developer_id: developerId,
          status: 'in_progress'
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select();
      
      if (updateError) {
        return { success: false, error: updateError.message };
      }
      
      return { success: true, data: updatedData?.[0] };
    }
    
    // For local IDs or invalid formats
    return { success: false, error: 'Operation only supported for database-backed help requests' };
    
  } catch (error) {
    console.error('[assignDeveloperToRequest] Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error assigning developer' 
    };
  }
};

// Export a helper function to just update attachments
export const updateHelpRequestAttachments = async (
  requestId: string,
  attachments: any[],
  userId: string | null
) => {
  // Call the main updateHelpRequest function with just the attachments field
  return updateHelpRequest(requestId, { attachments }, userId);
};
