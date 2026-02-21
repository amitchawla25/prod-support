import React, { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { getAllowedStatusTransitions, getStatusLabel } from '../../utils/helpRequestStatusUtils';

interface StatusTransitionDropdownProps {
  ticketId: string;
  currentStatus: string;
  userRole: 'client' | 'developer';
  onStatusChange: () => void;
}

export const StatusTransitionDropdown: React.FC<StatusTransitionDropdownProps> = ({
  ticketId,
  currentStatus,
  userRole,
  onStatusChange,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const validTransitions = useMemo(
    () => getAllowedStatusTransitions(currentStatus, userRole),
    [currentStatus, userRole],
  );

  if (validTransitions.length === 0) {
    return null;
  }

  const handleStatusChange = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      setIsUpdating(true);

      const { data, error } = await supabase
        .from('help_requests')
        .update({ status: selectedStatus })
        .eq('id', ticketId)
        .select('id, status')
        .single();

      if (error || !data?.id) {
        throw new Error(error?.message || 'No rows updated');
      }

      toast.success(`Status updated to ${getStatusLabel(selectedStatus)}`);
      setSelectedStatus('');
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Status Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Change status..." />
          </SelectTrigger>
          <SelectContent>
            {validTransitions.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleStatusChange} disabled={!selectedStatus || isUpdating} className="w-full">
          {isUpdating ? 'Updating...' : 'Update Status'}
        </Button>
      </CardContent>
    </Card>
  );
};
