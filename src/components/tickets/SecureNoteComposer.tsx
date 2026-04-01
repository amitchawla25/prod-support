import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { createSecureNote } from '../../integrations/supabase/secureNotes';

interface SecureNoteComposerProps {
  ticketId: string;
  ticketTitle: string;
  senderId: string;
  recipientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SecureNoteComposer: React.FC<SecureNoteComposerProps> = ({
  ticketId,
  ticketTitle,
  senderId,
  recipientId,
  open,
  onOpenChange,
}) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) {
      toast.error('Please enter the content of the secure note.');
      return;
    }

    setIsSending(true);
    const result = await createSecureNote({
      ticketId,
      ticketTitle,
      senderId,
      recipientId,
      plaintext: content.trim(),
    });
    setIsSending(false);

    if (result.success) {
      toast.success('Secure note sent. It will be viewable once and expires in 48 hours.');
      setContent('');
      onOpenChange(false);
    } else {
      toast.error(`Failed to send secure note: ${result.error}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share a Secure Note</DialogTitle>
          <DialogDescription>
            This note is encrypted in your browser before being stored. The recipient can view it
            exactly once — after that it is permanently gone. It also expires automatically after
            48 hours. Do not share passwords via chat; use this instead.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          placeholder="Paste credentials, API keys, repo URLs, or any sensitive info here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="text-sm font-mono"
        />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || !content.trim()}>
            {isSending ? 'Encrypting & Sending...' : 'Send Securely'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SecureNoteComposer;
