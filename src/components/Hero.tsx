
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { CheckCircle, ArrowRight, DollarSign } from 'lucide-react';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetHelp = () => {
    try {
      setIsLoading(true);
      if (isAuthenticated && userType === 'client') {
        navigate('/client/dashboard');
      } else if (isAuthenticated && userType === 'developer') {
        navigate('/developer/dashboard');
      } else {
        navigate('/register', { state: { userType: 'client' } });
      }
    } catch (error) {
      console.error('Navigation error in Hero:', error);
      toast.error('Navigation failed. Please try clicking again.');
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const handleJoinAsDev = () => {
    navigate('/register', { state: { userType: 'developer' } });
  };

  return (
    <section className="relative py-16 md:py-28 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(0,180,216,0.08),transparent_70%)]"></div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/10 text-[#1E3A8A] text-sm font-medium px-4 py-2 rounded-full mb-6">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Developers online and ready to help
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Stuck on your code?{' '}
            <span className="text-[#00B4D8]">Get a real developer to unblock you — fast.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Built for vibe coders who hit a wall. Post your problem, a developer applies, you get unstuck.
            No retainers. No agencies. No waiting.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button
              onClick={handleGetHelp}
              disabled={isLoading}
              className={`px-8 py-4 bg-[#1E3A8A] text-white rounded-full text-lg font-medium hover:bg-[#1E3A8A]/90 shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isLoading ? 'animate-pulse' : ''}`}
            >
              {isLoading ? (
                'Connecting...'
              ) : isAuthenticated && userType === 'client' ? (
                'Go to My Dashboard'
              ) : (
                <>Post Your Problem Free <ArrowRight className="h-4 w-4" /></>
              )}
            </button>

            {(!isAuthenticated || userType === 'developer') && (
              <button
                onClick={handleJoinAsDev}
                className="px-8 py-4 bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-full text-lg font-medium hover:bg-gray-50 shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Earn Helping Vibe Coders
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Free to post a problem
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Developers apply to you
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No long-term commitments
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
