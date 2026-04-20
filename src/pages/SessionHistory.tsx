
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import { supabase } from '../integrations/supabase/client';
import { Loader2, History, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getUserHomePage } from '../utils/navigationUtils';
import { Badge } from '../components/ui/badge';

interface SessionSummary {
  id: string;
  session_id: string;
  client_id: string;
  developer_id: string;
  client_name: string;
  developer_name: string;
  rating: number | null;
  feedback: string | null;
  cost: number | null;
  duration: number;
  created_at: string;
}

const SessionHistory: React.FC = () => {
  const { userId, userType } = useAuth();
  const navigate = useNavigate();
  const homePath = getUserHomePage(userType);

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchSessions = async () => {
      setIsLoading(true);
      const column = userType === 'developer' ? 'developer_id' : 'client_id';
      const { data, error } = await supabase
        .from('session_summaries')
        .select('*')
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load session history.');
      } else {
        setSessions(data || []);
      }
      setIsLoading(false);
    };

    fetchSessions();
  }, [userId, userType]);

  const counterpartName = (s: SessionSummary) =>
    userType === 'developer' ? s.client_name : s.developer_name;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold">Session History</h1>
          </div>
          <Button variant="outline" onClick={() => navigate(homePath)}>
            Back to Dashboard
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive rounded-lg p-4">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="bg-card p-8 rounded-xl border border-border/40 text-center">
            <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't completed any help sessions yet. Once you do, they will appear here.
            </p>
            <Button onClick={() => navigate(userType === 'developer' ? '/developer-tickets' : '/client/help')}>
              {userType === 'developer' ? 'Find Help Requests' : 'Get Help Now'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((s) => (
              <div key={s.id} className="bg-card rounded-xl border border-border/40 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {userType === 'developer' ? 'Client' : 'Developer'}:{' '}
                      <span className="text-foreground">{counterpartName(s)}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(s.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                      {s.duration ? ` · ${Math.round(s.duration / 60)} min` : ''}
                      {s.cost ? ` · $${(s.cost / 100).toFixed(2)}` : ''}
                    </p>
                    {s.feedback && (
                      <p className="text-sm text-muted-foreground mt-2 italic">"{s.feedback}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.rating !== null && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {s.rating}/5
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SessionHistory;
