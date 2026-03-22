
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequest, TicketComment } from '../../types/helpRequest';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';

interface TicketCommentsProps {
  ticketId?: string;
  userId: string;
  role?: string;
  ticket?: HelpRequest;
}

const TicketComments: React.FC<TicketCommentsProps> = ({
  ticketId,
  userId,
  role,
  ticket,
}) => {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    fetchComments();

    const channel = supabase
      .channel(`comments-for-ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_comments',
          filter: `ticket_id=eq.${ticketId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  // Scroll to bottom when new comments arrive
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [comments, isLoading]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select(`
          *,
          user:user_id (id, name, image, user_type)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      setComments(data || []);
    } catch (err) {
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('ticket_comments')
        .insert([
          {
            ticket_id: ticketId,
            user_id: userId,
            content: newComment.trim(),
          },
        ]);

      if (error) throw new Error(error.message);

      setNewComment('');
      fetchComments();
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const getRoleBadge = (userType?: string) => {
    if (userType === 'developer') {
      return (
        <Badge variant="outline" className="text-xs py-0 px-1.5 border-violet-300 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-950">
          Developer
        </Badge>
      );
    }
    if (userType === 'client') {
      return (
        <Badge variant="outline" className="text-xs py-0 px-1.5 border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-950">
          Client
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-5 space-y-4">
      <h2 className="text-lg font-semibold">Comments</h2>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-gray-200 dark:bg-zinc-700 rounded" />
                <div className="h-3 w-full bg-gray-200 dark:bg-zinc-700 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No comments yet. Start the conversation.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const isOwnComment = comment.user_id === userId;
            const userName = comment.user?.name || 'User';
            const userImage = comment.user?.image || '';
            const userInitial = userName[0]?.toUpperCase() || 'U';

            return (
              <div
                key={comment.id}
                className={`flex items-start gap-3 ${isOwnComment ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
                </Avatar>
                <div className={`flex flex-col gap-1 max-w-[75%] ${isOwnComment ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 ${isOwnComment ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-medium">{isOwnComment ? 'You' : userName}</span>
                    {getRoleBadge(comment.user?.user_type)}
                    <span className="text-xs text-muted-foreground">
                      {comment.created_at
                        ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
                        : ''}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      isOwnComment
                        ? 'bg-primary/10 dark:bg-primary/20'
                        : 'bg-muted'
                    }`}
                  >
                    {comment.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="space-y-2 pt-2 border-t">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment… (Ctrl+Enter to post)"
          className="resize-none"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !newComment.trim()}
            size="sm"
          >
            {isSubmitting ? 'Posting…' : 'Post Comment'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketComments;
