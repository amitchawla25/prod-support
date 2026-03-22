import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { supabase } from '../../integrations/supabase/client';
import { sendEmailNotification } from '../../integrations/supabase/notifications';
import { toast } from 'sonner';

interface PostSessionRatingModalProps {
  isOpen: boolean;
  ticketId: string;
  ticketTitle: string;
  clientId: string;
  developerId: string;
  onClose: () => void;
}

const PostSessionRatingModal: React.FC<PostSessionRatingModalProps> = ({
  isOpen,
  ticketId,
  ticketTitle,
  clientId,
  developerId,
  onClose,
}) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('session_summaries').insert({
        client_id: clientId,
        developer_id: developerId,
        rating,
        feedback: feedback.trim() || null,
      });

      if (error) {
        console.error('Error saving rating:', error);
        toast.error('Could not save your rating. Please try again.');
        return;
      }

      // Notify the developer their session was rated (non-blocking)
      sendEmailNotification({
        type: 'ticket_resolved',
        recipient_user_id: developerId,
        data: { ticket_title: ticketTitle, ticket_id: ticketId },
      }).catch(() => {});

      toast.success('Thanks for your rating!');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How did the session go?</DialogTitle>
          <DialogDescription>
            Your rating helps developers get more work and helps other clients make better decisions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className="h-10 w-10"
                  fill={(hovered || rating) >= star ? '#FBBF24' : 'none'}
                  stroke={(hovered || rating) >= star ? '#FBBF24' : '#9CA3AF'}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
            </p>
          )}

          <Textarea
            placeholder="Optional: What did the developer help you with? (Shown on their public profile)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Skip
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostSessionRatingModal;
