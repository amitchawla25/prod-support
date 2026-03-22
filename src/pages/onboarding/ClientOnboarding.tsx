
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import { useAuth, getCurrentUserData } from '../../contexts/auth';
import ClientBasicInfoStep from './steps/client/ClientBasicInfoStep';
import ClientPreferencesStep from './steps/client/ClientPreferencesStep';
import ClientProjectsStep from './steps/client/ClientProjectsStep';
import ClientCompletionStep from './steps/client/ClientCompletionStep';
import ProfileLoadingState from '../../components/profile/ProfileLoadingState';

const ClientOnboarding: React.FC = () => {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  
  useEffect(() => {
    const checkProfileStatus = async () => {
      setIsLoading(true);
      try {
        const userData = await getCurrentUserData();
        
        if (!userData) {
          // No user data found, possibly not logged in
          navigate('/login');
          return;
        }
        
        if (userData.profileCompleted) {
          // Profile already completed, redirect to dashboard
          navigate('/client/dashboard');
          return;
        }
        
        // Determine starting step based on any existing profile data
        if (userData.name && userData.email) {
          // Use type guards to check for client-specific properties
          if ('techStack' in userData && 'industry' in userData &&
              ((userData.techStack && userData.techStack.length > 0) || userData.industry)) {
            if ('projectTypes' in userData && userData.projectTypes && userData.projectTypes.length > 0) {
              setCurrentStep(4); // Almost complete, go to final step
            } else {
              setCurrentStep(3); // Has preferences, go to projects step
            }
          } else {
            setCurrentStep(2); // Has basic info, go to preferences step
          }
        } else {
          setCurrentStep(1); // Start from beginning
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      checkProfileStatus();
    } else {
      navigate('/login');
    }
  }, [userId, navigate]);
  
  if (isLoading) {
    return <ProfileLoadingState onForceLogout={logout} />;
  }
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ClientBasicInfoStep />;
      case 2:
        return <ClientPreferencesStep />;
      case 3:
        return <ClientProjectsStep />;
      case 4:
        return <ClientCompletionStep />;
      default:
        return <ClientBasicInfoStep />;
    }
  };
  
  return (
    <OnboardingProvider userType="client" totalSteps={4}>
      {renderCurrentStep()}
    </OnboardingProvider>
  );
};

export default ClientOnboarding;
