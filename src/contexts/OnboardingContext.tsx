
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getCurrentUserData, updateUserData, invalidateUserDataCache } from './auth';
import { Developer, Client } from '../types/product';
import { toast } from 'sonner';

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  completeOnboarding: () => Promise<boolean>;
  skipOnboarding: () => void;
  isOnboardingComplete: boolean;
  isLoading: boolean;
  userData: Partial<Developer | Client>;
  updateUserDataAndProceed: (data: Partial<Developer | Client>) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
  userType: 'client' | 'developer';
  totalSteps: number;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ 
  children, 
  userType,
  totalSteps
}) => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<Partial<Developer | Client>>({});
  
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const data = await getCurrentUserData();
        if (data) {
          setUserData(data);
          setIsOnboardingComplete(!!data.profileCompleted);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [userId]);
  
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };
  
  const updateUserDataAndProceed = async (data: Partial<Developer | Client>) => {
    setIsLoading(true);
    try {
      // Update userData state
      const updatedUserData = { ...userData, ...data };
      setUserData(updatedUserData);
      
      // Update in database
      await updateUserData(data);
      
      // Go to next step
      goToNextStep();
    } catch (error) {
      console.error('Error updating user data:', error);
      toast.error('Failed to update your information');
    } finally {
      setIsLoading(false);
    }
  };
  
  const completeOnboarding = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Create the update data with the ISO string date
      const updateData = {
        profileCompleted: true,
        profileCompletionPercentage: 100,
        onboardingCompletedAt: new Date().toISOString()
      };
      
      console.log('Completing onboarding with data:', updateData);
      const success = await updateUserData(updateData);
      
      if (success) {
        setIsOnboardingComplete(true);
        toast.success('Onboarding completed successfully!');
        
        // Invalidate cache to ensure fresh data on profile page
        if (userId) {
          console.log('Invalidating cache after onboarding completion');
          invalidateUserDataCache(userId);
          
          // Wait a moment to ensure data is invalidated
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // Redirect based on user type - use the specific path names
        if (userType === 'client') {
          console.log('Redirecting to client dashboard after onboarding');
          navigate('/client/dashboard', { replace: true });
        } else {
          console.log('Redirecting to developer dashboard after onboarding');
          navigate('/developer/dashboard', { replace: true });
        }
        
        return true;
      } else {
        toast.error('Failed to complete onboarding. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('An error occurred while completing onboarding');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const skipOnboarding = () => {
    toast.info('You can complete your profile later from your settings');
    if (userType === 'client') {
      navigate('/client/dashboard');
    } else {
      navigate('/developer/dashboard');
    }
  };
  
  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        totalSteps,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        completeOnboarding,
        skipOnboarding,
        isOnboardingComplete,
        isLoading,
        userData,
        updateUserDataAndProceed
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
