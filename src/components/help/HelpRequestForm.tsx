
import React from 'react';
import { useAuth } from '../../contexts/auth';
import { HelpRequestProvider } from '../../contexts/HelpRequestContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

// Import form components
import FormContainer from './form/FormContainer';
import Step1BasicInfo from './form/Step1BasicInfo';
import Step2AdditionalInfo from './form/Step2AdditionalInfo';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';

const HelpRequestFormContent: React.FC = () => {
  return (
    <FormContainer>
      <Step1BasicInfo />
      <Step2AdditionalInfo />
    </FormContainer>
  );
};

const HelpRequestForm: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();

  // Debug log to track user type
  console.log('[HelpRequestForm] Current user type:', userType, 'isAuthenticated:', isAuthenticated);

  // If user is authenticated as a developer, show permission error or redirect
  if (isAuthenticated && userType && userType !== 'client') {
    console.log('[HelpRequestForm] Non-client user detected, showing permission error');
    toast.error('Only clients can create help requests');
    
    return (
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertTitle>Permission Denied</AlertTitle>
          <AlertDescription>
            Developers cannot create help requests. Please switch to a client account or contact support.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-8">
          <a href="/developer/dashboard" className="text-primary hover:text-primary/80">
            Return to developer dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <HelpRequestProvider>
      <HelpRequestFormContent />
    </HelpRequestProvider>
  );
};

export default HelpRequestForm;
