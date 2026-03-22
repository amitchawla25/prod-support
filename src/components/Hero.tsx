
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import SearchBar from './SearchBar';
import { Shield, Clock, Zap, ArrowRight } from 'lucide-react';

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
  
  const handleBrowseRequests = () => {
    navigate('/developer/dashboard');
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(0,180,216,0.08),transparent_70%)]"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            On-Demand Dev Support. <span className="text-[#00B4D8]">Fast, Reliable, No Hassle.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Clients get instant solutions. Developers get meaningful work.
          </p>
          
          <div className="max-w-2xl mx-auto mb-10">
            <SearchBar 
              className="shadow-md" 
              placeholder="Search for any development service..."
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-12">
            <button
              onClick={handleGetHelp}
              disabled={isLoading}
              className={`px-8 py-4 bg-[#1E3A8A] text-white rounded-full text-lg font-medium hover:bg-[#1E3A8A]/90 shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex-1 sm:flex-initial ${isLoading ? 'animate-pulse' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  Connecting
                  <span className="ml-2 flex space-x-1">
                    <span className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </span>
              ) : (
                isAuthenticated && userType === 'client' ? 'View Your Dashboard' : 'Get Developer Help Now'
              )}
            </button>
            
            <button
              onClick={handleBrowseRequests}
              className="px-8 py-4 bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-full text-lg font-medium hover:bg-gray-50 shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1 flex-1 sm:flex-initial flex items-center justify-center gap-2"
            >
              Browse Help Requests
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mt-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-[#FF8800]" />
              <span>Match in 5 minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-[#FF8800]" />
              <span>100% vetted professionals</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-[#FF8800]" />
              <span>Instant solutions</span>
            </div>
          </div>
          
          <div className="mt-16">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Trusted by</p>
            <div className="flex justify-center items-center gap-8 opacity-70">
              <div className="h-8">
                <img src="https://miro.medium.com/v2/resize:fit:8000/1*UzPNplj4B-x2BLnc-Grjmw.png" alt="Google" className="h-full object-contain" />
              </div>
              <div className="h-8">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png" alt="IBM" className="h-full object-contain" />
              </div>
              <div className="h-8">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png" alt="Microsoft" className="h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
