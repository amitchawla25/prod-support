import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import {
  getKickoffQuestions,
  answerKickoffQuestion,
  KickoffQuestion,
} from '../../integrations/supabase/kickoffQuestions';

interface ClientActionRequiredProps {
  ticketId: string;
  ticketTitle: string;
  clientId: string;
  developerId: string;
}

const ClientActionRequired: React.FC<ClientActionRequiredProps> = ({
  ticketId,
  ticketTitle,
  clientId,
  developerId,
}) => {
  const [questions, setQuestions] = useState<KickoffQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    const result = await getKickoffQuestions(ticketId);
    if (result.success) {
      setQuestions(result.data || []);
    }
    setIsLoading(false);
  }, [ticketId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const unanswered = questions.filter((q) => !q.answer);

  if (isLoading || unanswered.length === 0) return null;

  const handleSubmitAnswer = async (questionId: string) => {
    const answer = answers[questionId]?.trim();
    if (!answer) {
      toast.error('Please write a response before submitting.');
      return;
    }

    setSubmitting((prev) => ({ ...prev, [questionId]: true }));

    const remainingAfterThis = unanswered.filter((q) => q.id !== questionId);
    const allAnswered = remainingAfterThis.length === 0;

    const result = await answerKickoffQuestion({
      ticketId,
      clientId,
      developerId,
      questionId,
      answer,
      ticketTitle,
      allAnswered,
    });

    setSubmitting((prev) => ({ ...prev, [questionId]: false }));

    if (result.success) {
      toast.success('Response sent.');
      await loadQuestions();
    } else {
      toast.error(`Failed to send response: ${result.error}`);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-amber-800">Action Required</CardTitle>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
            {unanswered.length} pending
          </Badge>
        </div>
        <p className="text-xs text-amber-700">
          The developer needs some information before they can begin. Please respond below.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {unanswered.map((question) => (
          <div key={question.id} className="space-y-2">
            <p className="text-sm font-medium">{question.content}</p>
            <Textarea
              placeholder="Your response..."
              value={answers[question.id] || ''}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
              }
              rows={2}
              className="text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSubmitAnswer(question.id)}
              disabled={submitting[question.id] || !answers[question.id]?.trim()}
            >
              {submitting[question.id] ? 'Sending...' : 'Send Response'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ClientActionRequired;
