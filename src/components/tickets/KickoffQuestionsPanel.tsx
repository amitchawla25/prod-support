import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import {
  KICKOFF_QUESTION_TEMPLATES,
  hasSubmittedKickoffQuestions,
  submitKickoffQuestions,
} from '../../integrations/supabase/kickoffQuestions';

interface KickoffQuestionsPanelProps {
  ticketId: string;
  ticketTitle: string;
  developerId: string;
  clientId: string;
}

const KickoffQuestionsPanel: React.FC<KickoffQuestionsPanelProps> = ({
  ticketId,
  ticketTitle,
  developerId,
  clientId,
}) => {
  const [alreadySubmitted, setAlreadySubmitted] = useState<boolean | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    hasSubmittedKickoffQuestions(ticketId, developerId).then(setAlreadySubmitted);
  }, [ticketId, developerId]);

  const toggleTemplate = (template: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(template) ? prev.filter((t) => t !== template) : [...prev, template]
    );
  };

  const handleSubmit = async () => {
    const questions = [
      ...selectedTemplates,
      ...(customQuestion.trim() ? [customQuestion.trim()] : []),
    ];

    if (questions.length === 0) {
      toast.error('Please select at least one question or write a custom one.');
      return;
    }

    setIsSubmitting(true);
    const result = await submitKickoffQuestions({
      ticketId,
      developerId,
      clientId,
      questions,
      ticketTitle,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Questions sent to the client. You will be notified when they respond.');
      setAlreadySubmitted(true);
    } else {
      toast.error(`Failed to send questions: ${result.error}`);
    }
  };

  if (alreadySubmitted === null) return null;

  if (alreadySubmitted) {
    return (
      <Card className="border-blue-100 bg-blue-50/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Kickoff Questions Sent</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-blue-700">
            Your pre-work questions have been sent to the client. You will receive a notification once they respond.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Before You Start — Request What You Need</CardTitle>
        <p className="text-xs text-muted-foreground">
          Select what you need from the client before work begins. They will be notified to respond.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {KICKOFF_QUESTION_TEMPLATES.map((template) => (
            <Badge
              key={template}
              variant={selectedTemplates.includes(template) ? 'default' : 'outline'}
              className="cursor-pointer text-xs py-1 px-2 whitespace-normal text-left h-auto"
              onClick={() => toggleTemplate(template)}
            >
              {template}
            </Badge>
          ))}
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Custom question (optional)</p>
          <Textarea
            placeholder="Write a custom question or request..."
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            rows={2}
            className="text-sm"
          />
        </div>

        <Button
          size="sm"
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || (selectedTemplates.length === 0 && !customQuestion.trim())}
        >
          {isSubmitting ? 'Sending...' : 'Send Questions to Client'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KickoffQuestionsPanel;
