import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  getPendingSecureNotes,
  viewSecureNote,
} from '../../integrations/supabase/secureNotes';

interface SecureNoteViewerProps {
  ticketId: string;
  recipientId: string;
  senderId: string;
}

const SecureNoteViewer: React.FC<SecureNoteViewerProps> = ({
  ticketId,
  recipientId,
  senderId,
}) => {
  const [pendingNotes, setPendingNotes] = useState<{ id: string; created_at: string }[]>([]);
  const [viewingNoteId, setViewingNoteId] = useState<string | null>(null);
  const [revealedContent, setRevealedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const loadPendingNotes = useCallback(async () => {
    const result = await getPendingSecureNotes(ticketId, recipientId);
    if (result.success) {
      setPendingNotes(result.data || []);
    }
  }, [ticketId, recipientId]);

  useEffect(() => {
    loadPendingNotes();
  }, [loadPendingNotes]);

  if (pendingNotes.length === 0) return null;

  const handleView = async (noteId: string) => {
    setIsLoading(true);
    const result = await viewSecureNote({ noteId, ticketId, senderId, recipientId });
    setIsLoading(false);

    if (result.success) {
      setRevealedContent(result.plaintext!);
      setViewingNoteId(noteId);
      setAcknowledged(false);
      // Remove from pending list immediately
      setPendingNotes((prev) => prev.filter((n) => n.id !== noteId));
    } else {
      toast.error(result.error || 'Failed to retrieve secure note.');
    }
  };

  const handleClose = () => {
    setViewingNoteId(null);
    setRevealedContent(null);
  };

  return (
    <>
      <Card className="border-purple-200 bg-purple-50/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">
            Secure Note Available ({pendingNotes.length})
          </CardTitle>
          <p className="text-xs text-purple-700">
            You have a one-time encrypted note. Click to reveal — it will be permanently deleted after viewing.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {pendingNotes.map((note) => (
            <Button
              key={note.id}
              size="sm"
              variant="outline"
              className="w-full border-purple-300 text-purple-800"
              onClick={() => handleView(note.id)}
              disabled={isLoading}
            >
              {isLoading ? 'Decrypting...' : `Reveal Note (sent ${new Date(note.created_at).toLocaleDateString()})`}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!viewingNoteId} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Secure Note</DialogTitle>
            <DialogDescription>
              This is your one-time note. Copy what you need now — this content is gone once you close this dialog.
            </DialogDescription>
          </DialogHeader>

          <pre className="bg-muted rounded-md p-4 text-sm font-mono whitespace-pre-wrap break-all select-all">
            {revealedContent}
          </pre>

          <DialogFooter>
            <Button
              onClick={() => {
                if (revealedContent) {
                  navigator.clipboard.writeText(revealedContent);
                  toast.success('Copied to clipboard.');
                }
              }}
              variant="outline"
            >
              Copy to Clipboard
            </Button>
            <Button onClick={handleClose}>Done — Close Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecureNoteViewer;
