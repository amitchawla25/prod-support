
import React from 'react';
import { BotOff, GitBranch, Bug, Puzzle, Flame } from 'lucide-react';
import { Card } from './ui/card';

interface PainPoint {
  icon: JSX.Element;
  title: string;
  description: string;
}

const PainPointsSection: React.FC = () => {
  const painPoints: PainPoint[] = [
    {
      icon: <BotOff className="h-6 w-6 text-orange-500" />,
      title: "AI gave you broken code",
      description: "Claude or ChatGPT generated something that almost works. You've been tweaking it for 3 hours and it's getting worse."
    },
    {
      icon: <Bug className="h-6 w-6 text-orange-500" />,
      title: "A bug you just can't crack",
      description: "The error makes no sense. Stack Overflow has nothing. You need a real human to look at it."
    },
    {
      icon: <GitBranch className="h-6 w-6 text-orange-500" />,
      title: "Deployment is broken",
      description: "It worked locally. Now it's in production and everything is on fire. You need someone who's seen this before."
    },
    {
      icon: <Puzzle className="h-6 w-6 text-orange-500" />,
      title: "Architecture decisions",
      description: "Should you use REST or GraphQL? SQL or NoSQL? You need 20 minutes with someone who actually knows."
    },
    {
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      title: "Performance hell",
      description: "Your app is slow and you don't know why. Someone needs to look at the queries, the renders, the bundle — all of it."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
            Sound familiar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            These are the moments ProdSupport was built for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {painPoints.map((point, index) => (
            <Card key={index} className="p-6 transition-colors hover:bg-secondary/50">
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                {point.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{point.title}</h3>
              <p className="text-muted-foreground">{point.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPointsSection;
