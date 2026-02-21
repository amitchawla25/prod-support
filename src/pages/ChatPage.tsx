import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ChatInterface from '../components/chat/ChatInterface';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const [searchParams] = useSearchParams();

  const otherId = searchParams.get('with') || '';
  const otherName = searchParams.get('name') || 'User';

  if (!ticketId || !otherId) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <p className="text-muted-foreground">Missing chat context. Open chat from a ticket to continue.</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 h-[calc(100vh-140px)]">
        <Button variant="ghost" className="mb-3" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Ticket
        </Button>
        <div className="border rounded-lg h-[calc(100%-48px)]">
          <ChatInterface helpRequestId={ticketId} otherId={otherId} otherName={otherName} />
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
