
import { supabase } from './client';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  related_entity_id: string;
  entity_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const fetchUserNotifications = async (userId: string | null) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', data: [] };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data as Notification[] };
  } catch (error) {
    console.error('Exception fetching notifications:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      data: [] 
    };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select();

    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception marking notification as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception marking all notifications as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const setupNotificationsSubscription = (userId: string, callback: (notification: any) => void) => {
  console.log('Setting up notifications subscription for user:', userId);
  
  if (!userId) {
    console.error('User ID is required for notifications subscription');
    return () => {};
  }
  
  try {
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          callback(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Notifications subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to notifications');
          toast.error('Could not connect to notification updates. Please refresh.');
        }
      });
      
    return () => {
      console.log('Cleaning up notifications subscription');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Exception setting up notifications subscription:', error);
    toast.error('Notification connection failed. Some features may not work.');
    return () => {}; // Return empty cleanup function
  }
};

export const createNotification = async (notification: {
  user_id: string;
  related_entity_id: string;
  entity_type: string;
  title: string;
  message: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select();

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception creating notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const sendEmailNotification = async (payload: {
  type: 'new_application' | 'application_approved' | 'ticket_resolved';
  recipient_user_id: string;
  data: {
    ticket_title: string;
    ticket_id: string;
    developer_name?: string;
    client_name?: string;
  };
}) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email-notification', {
      body: payload,
    });

    if (error) {
      console.error('Error sending email notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception sending email notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
