
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Trophy, Coins, RocketIcon, HeartHandshake } from 'lucide-react';

const DeveloperHero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(0,180,216,0.1),transparent_70%)]"></div>
      
      {/* Animated code snippets background (desktop only) */}
      <div className="hidden lg:block absolute inset-0 overflow-hidden -z-5">
        <div className="absolute left-10 top-1/4 w-64 h-40 rounded-xl overflow-hidden shadow-lg opacity-80 transform rotate-3 animate-float">
          <img 
            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&auto=format" 
            alt="Code editor" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute right-12 top-1/3 w-56 h-36 rounded-xl overflow-hidden shadow-lg opacity-80 transform -rotate-3 animate-float-delayed">
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&auto=format" 
            alt="Developer working" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Your Expertise Is <span className="text-[#00B4D8]">Worth More</span> Than You Think
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Top developers earn $75-150/hr helping clients solve their toughest problems. Join our platform and turn your skills into income.
          </p>
          
          {/* Stats section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-10">
            <div className="bg-white/50 backdrop-blur-sm border border-border/30 rounded-xl p-4 shadow-sm">
              <Trophy className="h-8 w-8 text-[#FF8800] mx-auto mb-2" />
              <h3 className="text-2xl font-bold">$150/hr</h3>
              <p className="text-sm text-muted-foreground">Top Earners</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm border border-border/30 rounded-xl p-4 shadow-sm">
              <Coins className="h-8 w-8 text-[#FF8800] mx-auto mb-2" />
              <h3 className="text-2xl font-bold">$3.2M</h3>
              <p className="text-sm text-muted-foreground">Paid to Devs</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm border border-border/30 rounded-xl p-4 shadow-sm">
              <RocketIcon className="h-8 w-8 text-[#FF8800] mx-auto mb-2" />
              <h3 className="text-2xl font-bold">15,000+</h3>
              <p className="text-sm text-muted-foreground">Issues Solved</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm border border-border/30 rounded-xl p-4 shadow-sm">
              <HeartHandshake className="h-8 w-8 text-[#FF8800] mx-auto mb-2" />
              <h3 className="text-2xl font-bold">96%</h3>
              <p className="text-sm text-muted-foreground">Client Satisfaction</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-8">
            <Button 
              size="lg"
              onClick={() => navigate('/developer/dashboard')}
              className="bg-[#1E3A8A] text-white rounded-full hover:bg-[#1E3A8A]/90 shadow-md font-medium"
            >
              Browse All Available Tickets
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/profile')}
              className="border-[#1E3A8A] text-[#1E3A8A] rounded-full hover:bg-[#1E3A8A]/5 shadow-md font-medium"
            >
              Update Your Profile
            </Button>
          </div>
          
          <div className="mt-8 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00B4D8] to-[#1E3A8A] rounded-lg blur opacity-20"></div>
            <div className="relative bg-white/70 backdrop-blur-sm border border-border/30 rounded-lg p-6 shadow-sm">
              <blockquote className="italic text-lg">
                "I've earned over $42,000 in the past three months solving problems I enjoy. This platform has been a game-changer for my freelance career."
              </blockquote>
              <div className="mt-4 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                  <img 
                    src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&auto=format" 
                    alt="Developer testimonial" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="font-medium">Alex Rodriguez</p>
                  <p className="text-sm text-muted-foreground">Full Stack Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeveloperHero;
