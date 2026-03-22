
import React from 'react';
import { Bot, Rocket, GraduationCap, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const TargetAudienceSection: React.FC = () => {
  const audiences = [
    {
      icon: <Bot className="h-8 w-8 text-[#00B4D8]" />,
      title: "Vibe Coders",
      description: "You're building with AI — Cursor, Bolt, Lovable, Replit. The AI got you 80% there but you're stuck on the last 20%. That's exactly what this is for.",
      cta: "Post your problem",
      userType: "client"
    },
    {
      icon: <Rocket className="h-8 w-8 text-[#00B4D8]" />,
      title: "Indie Hackers & Founders",
      description: "You're solo, moving fast, and can't afford to spend 3 days debugging. Get unstuck in hours and get back to shipping.",
      cta: "Get unblocked",
      userType: "client"
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-[#00B4D8]" />,
      title: "Learners & Students",
      description: "Working on a project and hit a wall? Get real guidance from a working developer, not just a Stack Overflow answer.",
      cta: "Get help now",
      userType: "client"
    },
    {
      icon: <Wrench className="h-8 w-8 text-[#00B4D8]" />,
      title: "Developers Who Help",
      description: "Earn money helping people get unstuck. Browse real problems, apply when you know the answer, get paid for your expertise.",
      cta: "Start earning",
      userType: "developer"
    }
  ];

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="heading-2 mb-4">Who Is This For?</h2>
          <p className="body-text max-w-2xl mx-auto">
            If you build with code — or want to help people who do — you're in the right place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm border border-border/30 flex flex-col h-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-[#1E3A8A]/5 flex items-center justify-center flex-shrink-0">
                  {audience.icon}
                </div>
                <h3 className="text-xl font-semibold">{audience.title}</h3>
              </div>
              <p className="text-muted-foreground mb-6">{audience.description}</p>
              <div className="mt-auto">
                <Link
                  to="/register"
                  state={{ userType: audience.userType }}
                  className="text-[#1E3A8A] font-medium inline-flex items-center group"
                >
                  {audience.cta}
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
