
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const VerificationCanceledPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
            <div className="p-8 text-center">
              <div className="py-8">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/40">
                    <XCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Canceled</h2>
                <p className="text-muted-foreground mb-6">
                  You've canceled the verification payment. You can still use the platform, 
                  but verified developers receive higher visibility and other benefits.
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="default" 
                    onClick={() => navigate('/onboarding/developer')}
                    className="w-full"
                  >
                    Continue Without Verification
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/developer/dashboard')}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerificationCanceledPage;
