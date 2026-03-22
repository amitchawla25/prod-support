
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import { useAuth, getCurrentUserData } from '../../contexts/auth';
import DeveloperBasicInfoStep from './steps/developer/DeveloperBasicInfoStep';
import DeveloperSkillsStep from './steps/developer/DeveloperSkillsStep';
import DeveloperRatesStep from './steps/developer/DeveloperRatesStep';
import DeveloperAvailabilityStep from './steps/developer/DeveloperAvailabilityStep';
import DeveloperCompletionStep from './steps/developer/DeveloperCompletionStep';
import ProfileLoadingState from '../../components/profile/ProfileLoadingState';
import { toast } from 'sonner';

const DeveloperOnboarding: React.FC = () => {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);
  
  useEffect(() => {
    const checkProfileStatus = async () => {
      setIsLoading(true);
      
      // Set a timeout to detect slow loading
      const timeoutId = setTimeout(() => {
        console.log('Onboarding data loading timeout reached');
        setLoadingTimeoutReached(true);
        setIsLoading(false);
        toast.error("Loading profile data is taking longer than expected. You can try logging out and back in.");
      }, 10000);
      
      try {
        if (!userId) {
          clearTimeout(timeoutId);
          navigate('/login');
          return;
        }
        
        console.log('Checking developer profile status for user:', userId);
        const userData = await getCurrentUserData();
        
        clearTimeout(timeoutId);
        
        if (!userData) {
          // No user data found, possibly not logged in
          console.error('No user data found during onboarding check');
          navigate('/login');
          return;
        }
        
        console.log('Developer onboarding - user data:', userData);
        
        if (userData.profileCompleted) {
          // Profile already completed, redirect to dashboard
          console.log('Profile already marked complete, redirecting to dashboard');
          navigate('/developer/dashboard');
          return;
        }
        
        // Determine starting step based on any existing profile data
        if (userData.name && userData.email) {
          // Use type guards to check for developer-specific properties
          if ('skills' in userData && userData.skills && userData.skills.length > 0) {
            if ('hourlyRate' in userData && 'minuteRate' in userData && userData.hourlyRate && userData.minuteRate) {
              if (userData.availability !== undefined) {
                setCurrentStep(5); // Almost complete, go to final step
                console.log('Developer profile almost complete, starting at step 5');
              } else {
                setCurrentStep(4); // Has rates, go to availability step
                console.log('Developer has rates set, starting at step 4');
              }
            } else {
              setCurrentStep(3); // Has skills, go to rates step
              console.log('Developer has skills set, starting at step 3');
            }
          } else {
            setCurrentStep(2); // Has basic info, go to skills step
            console.log('Developer has basic info, starting at step 2');
          }
        } else {
          setCurrentStep(1); // Start from beginning
          console.log('Starting developer onboarding from step 1');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error checking profile status:', error);
        toast.error("Failed to check profile status. You may need to log in again.");
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };
    
    checkProfileStatus();
  }, [userId, navigate, logout]);
  
  if (isLoading) {
    return <ProfileLoadingState onForceLogout={logout} />;
  }
  
  if (loadingTimeoutReached) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Issue Detected</h2>
          <p className="mb-4">We're having trouble loading your profile data. This could be due to connectivity issues or a problem with your account.</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="button-primary w-full"
            >
              Try Again
            </button>
            <button 
              onClick={() => logout()}
              className="button-outline w-full"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <DeveloperBasicInfoStep />;
      case 2:
        return <DeveloperSkillsStep />;
      case 3:
        return <DeveloperRatesStep />;
      case 4:
        return <DeveloperAvailabilityStep />;
      case 5:
        return <DeveloperCompletionStep />;
      default:
        return <DeveloperBasicInfoStep />;
    }
  };
  
  return (
    <OnboardingProvider userType="developer" totalSteps={5}>
      {renderCurrentStep()}
    </OnboardingProvider>
  );
};

export default DeveloperOnboarding;
