
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Code2 } from 'lucide-react';

const CTASection: React.FC = () => {
  const navigate = useNavigate();

  const handleClientSignup = () => {
    navigate('/register', { state: { userType: 'client' } });
  };

  const handleDeveloperSignup = () => {
    navigate('/register', { state: { userType: 'developer' } });
  };

  return (
    <section className="bg-gradient-to-b from-secondary/30 to-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="heading-2 mb-4">Ready to stop being stuck?</h2>
          <p className="body-text text-muted-foreground max-w-2xl mx-auto">
            Post your problem for free — or join as a developer and start earning.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white border border-border/40 rounded-xl p-8 text-center flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-[#1E3A8A]/10 p-4 rounded-full mb-4">
              <MessageSquare className="h-8 w-8 text-[#1E3A8A]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">I'm stuck on something</h3>
            <p className="text-muted-foreground mb-6">
              Post your problem in 2 minutes. A real developer will apply and help you get unblocked.
            </p>
            <button
              onClick={handleClientSignup}
              className="button-primary w-full"
            >
              Post Your Problem Free
            </button>
          </div>

          <div className="bg-white border border-border/40 rounded-xl p-8 text-center flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-[#1E3A8A]/10 p-4 rounded-full mb-4">
              <Code2 className="h-8 w-8 text-[#1E3A8A]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">I can help people get unstuck</h3>
            <p className="text-muted-foreground mb-6">
              Browse real problems from vibe coders. Apply when you know the fix. Earn for your expertise.
            </p>
            <button
              onClick={handleDeveloperSignup}
              className="button-secondary w-full"
            >
              Join as a Developer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
