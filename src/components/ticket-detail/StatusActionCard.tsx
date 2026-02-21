import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { HelpRequest } from '../../types/helpRequest';
import { UserType, getAllowedStatusTransitions, getStatusLabel } from '../../utils/helpRequestStatusUtils';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';

interface StatusActionCardProps {
  ticket: HelpRequest;
  userType: UserType;
  onStatusUpdated: () => Promise<void>;
}

const updateHelpRequestStatus = async (requestId: string, status: string) => {
  const { data, error } = await supabase
    .from('help_requests')
    .update({ status })
    .eq('id', requestId)
    .select('id, status')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data?.id) {
    return { success: false, error: 'No rows were updated.' };
  }

  return { success: true, data };
};

const StatusActionCard: React.FC<StatusActionCardProps> = ({ ticket, userType, onStatusUpdated }) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableTransitions = useMemo(() => {
    if (!ticket?.status || userType === 'system') return [];
    return getAllowedStatusTransitions(ticket.status, userType);
  }, [ticket?.status, userType]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!ticket?.id) return;

    try {
      setIsUpdating(newStatus);
      setError(null);

      const response = await updateHelpRequestStatus(ticket.id, newStatus);

      if (!response.success) {
        setError(response.error || 'Failed to update status');
        toast.error(response.error || 'Status update failed');
        return;
      }

      await onStatusUpdated();
      toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
    } catch (err: any) {
      const message = err?.message || 'Failed to update status';
      setError(message);
      toast.error(message);
    } finally {
      setIsUpdating(null);
    }
  };

  if (!ticket?.id) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Status Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {availableTransitions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No status actions available for this stage.</p>
        ) : (
          <div className="space-y-2">
            {availableTransitions.map((transition) => (
              <Button
                key={transition}
                onClick={() => handleStatusUpdate(transition)}
                disabled={!!isUpdating}
                className="w-full"
              >
                {isUpdating === transition && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {getStatusLabel(transition)}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusActionCard;
