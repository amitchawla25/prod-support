
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ListChecks, Send, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const HelpRequestSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { requestId, ticketData } = location.state || {};
  
  useEffect(() => {
    if (!requestId) {
      toast.error("We couldn't find details about your request. Please check your requests dashboard.");
    }
  }, [requestId]);

  // If no requestId is found, give a helpful message
  if (!requestId) {
    return (
      <Card className="max-w-3xl mx-auto p-8 rounded-xl shadow-sm text-center">
        <div className="flex justify-center mb-4">
          <Clock className="h-16 w-16 text-amber-500" />
        </div>
        
        <h2 className="text-2xl font-semibold mb-4">Request Information Not Found</h2>
        
        <p className="text-muted-foreground mb-6">
          We couldn't locate your request details. This might happen if you accessed this page directly
          or if your session has expired.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/client/tickets')}
            className="flex items-center justify-center gap-2"
          >
            <ListChecks className="h-5 w-5" />
            View Your Requests
          </Button>
          
          <Button
            onClick={() => navigate('/get-help')}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Send className="h-5 w-5" />
            Submit a New Request
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto rounded-xl shadow-sm border border-border/40 overflow-hidden">
      <div className="bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10 p-8 text-center border-b border-border/40">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-semibold mb-2">Help Request Submitted Successfully!</h2>
        
        <p className="text-muted-foreground">
          Your request has been received and our system is now looking for the best developers to match with your needs.
        </p>
        
        <Badge variant="outline" className="mt-4 bg-white/80 dark:bg-background/80">
          Request ID: {requestId.substring(0, 8)}...
        </Badge>
      </div>
      
      <div className="p-8">
        <h3 className="text-lg font-medium mb-4">What happens next?</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              1
            </div>
            <div>
              <h4 className="font-medium">Developer Matching</h4>
              <p className="text-sm text-muted-foreground">Our system will match your request with available developers based on expertise and availability.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              2
            </div>
            <div>
              <h4 className="font-medium">Developer Applications</h4>
              <p className="text-sm text-muted-foreground">You'll receive notifications when developers apply to help with your request.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              3
            </div>
            <div>
              <h4 className="font-medium">Session Scheduling</h4>
              <p className="text-sm text-muted-foreground">Once you accept a developer, you can schedule a help session at a time that works for both of you.</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8">
          <Button
            onClick={() => navigate('/client/tickets')}
            className="flex items-center justify-center gap-2"
          >
            <ListChecks className="h-5 w-5" />
            Track Your Requests
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => navigate('/get-help')}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Send className="h-5 w-5" />
            Submit Another Request
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default HelpRequestSuccess;
