
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth, invalidateUserDataCache } from '../contexts/auth';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const VerificationSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const { userId } = useAuth();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        console.error('Missing session information');
        toast.error('Missing session information');
        setVerificationStatus('error');
        setIsVerifying(false);
        return;
      }
      
      if (!userId) {
        console.error('User not authenticated');
        toast.error('You need to be logged in to complete verification');
        setVerificationStatus('error');
        setIsVerifying(false);
        return;
      }

      console.log('Verifying payment with session ID:', sessionId);
      console.log('Current user ID:', userId);

      try {
        const { data, error } = await supabase.functions.invoke('verify-developer-payment', {
          body: { sessionId, userId }
        });

        console.log('Verification response:', data, error);

        if (error) {
          console.error('Verification error:', error);
          toast.error(`Failed to verify payment: ${error.message || 'Unknown error'}`);
          setVerificationStatus('error');
        } else if (data?.success) {
          // Clear any cached user data to ensure the verification status is refreshed
          invalidateUserDataCache(userId);
          
          // Double check the database to confirm the status was updated
          const { data: verifyData, error: verifyError } = await supabase
            .from('developer_profiles')
            .select('premium_verified')
            .eq('id', userId)
            .single();
            
          if (verifyError) {
            console.warn('Could not verify database update:', verifyError);
          } else {
            console.log('Database verification status:', verifyData?.premium_verified);
          }
          
          toast.success('Your developer account has been verified!');
          setVerificationStatus('success');
        } else {
          toast.error(data?.message || 'Verification failed');
          setVerificationStatus('error');
        }
      } catch (err) {
        console.error('Error during verification:', err);
        toast.error('An error occurred during verification');
        setVerificationStatus('error');
      } finally {
        setIsVerifying(false);
      }
    };

    if (sessionId && userId) {
      verifyPayment();
    } else {
      // Small delay to ensure auth is fully loaded
      const timeout = setTimeout(() => {
        if (!userId) {
          console.warn('User not authenticated after timeout');
          setIsVerifying(false);
          setVerificationStatus('error');
          toast.error('Authentication required to complete verification');
        }
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [sessionId, userId]);

  const handleContinue = () => {
    if (verificationStatus === 'success') {
      // Force refresh the profile page to show updated verification status
      navigate('/developer/dashboard?refresh=true');
    } else {
      navigate('/developer/dashboard');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
            <div className="p-8 text-center">
              {isVerifying ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
                  <p className="text-muted-foreground">Please wait while we verify your payment...</p>
                </div>
              ) : verificationStatus === 'success' ? (
                <div className="py-8">
                  <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                      <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Verification Complete</h2>
                  <p className="text-muted-foreground mb-6">
                    Your developer account has been successfully verified. You now have access to premium features!
                  </p>
                  <Button onClick={handleContinue} className="w-full">
                    Continue to Dashboard
                  </Button>
                </div>
              ) : (
                <div className="py-8">
                  <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                      <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Verification Issue</h2>
                  <p className="text-muted-foreground mb-6">
                    We couldn't verify your payment at this time. This could be due to a technical issue. You can try again later from your profile settings.
                  </p>
                  <Button onClick={handleContinue} className="w-full">
                    Continue to Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerificationSuccessPage;
