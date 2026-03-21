
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { Loader2 } from 'lucide-react';
import { debugCheckProfile, debugCreateMissingProfiles } from '../../contexts/auth/authUtils';
import { toast } from 'sonner';

interface AuthCheckProps {
  children: React.ReactNode;
  allowPublicAccess?: boolean;
  requiredUserType?: 'developer' | 'client';
}

const AuthCheck: React.FC<AuthCheckProps> = ({ 
  children, 
  allowPublicAccess = false,
  requiredUserType
}) => {
  const { isAuthenticated, userType: authUserType, userId, isLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const location = useLocation();

  // Log what's happening with auth for debugging
  useEffect(() => {
    console.log(`AuthCheck (${location.pathname}):`, {
      isAuthenticated,
      authUserType,
      userId, 
      requiredType: requiredUserType,
      allowPublicAccess,
      isLoading,
      isVerifying
    });
  }, [isAuthenticated, authUserType, userId, requiredUserType, allowPublicAccess, location.pathname, isLoading, isVerifying]);

  // Show toast when redirecting because of wrong user type
  // Guard with !isLoading to avoid false positives during auth initialization
  // (userType is null until the profile fetch resolves, even for authenticated users)
  useEffect(() => {
    if (!isLoading && isAuthenticated && requiredUserType && authUserType !== requiredUserType) {
      toast.error(`This page is only accessible to ${requiredUserType}s.`, {
        id: `user-type-mismatch-${requiredUserType}`
      });
      console.log(`User type mismatch: Required ${requiredUserType}, got ${authUserType}, path: ${location.pathname}`);
    }
  }, [isLoading, isAuthenticated, requiredUserType, authUserType, location.pathname]);

  // Verify profile consistency when needed
  useEffect(() => {
    const verifyUserProfile = async () => {
      if (!isAuthenticated || !userId || allowPublicAccess) {
        setIsVerifying(false);
        return;
      }
      
      try {
        // Check if profiles exist and are consistent
        const profileCheck = await debugCheckProfile(userId);
        
        if (!profileCheck.complete) {
          console.warn("Profile check found incomplete profile state:", profileCheck);
          
          // Only attempt auto-repair if we know the user type
          if (authUserType) {
            const repairResult = await debugCreateMissingProfiles(
              userId,
              authUserType,
              "", // Will be fetched from auth if needed
              ""  // Will be fetched from auth if needed
            );
            
            console.log("Profile repair attempt result:", repairResult);
            
            if (!repairResult.success) {
              toast.error("There was a problem with your profile. Please try logging out and back in.");
            }
          }
        }
      } catch (error) {
        console.error("Error in profile verification:", error);
      } finally {
        setIsVerifying(false);
      }
    };
    
    if (!isLoading) {
      verifyUserProfile();
    }
  }, [isLoading, isAuthenticated, userId, authUserType, allowPublicAccess]);

  // Loading state
  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  // Allow public access routes to be viewed by anyone
  if (allowPublicAccess) {
    return <>{children}</>;
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    console.log(`User not authenticated, redirecting to login from ${location.pathname}`);
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} state={{ returnTo: location.pathname }} replace />;
  }

  // User is authenticated - render children
  return <>{children}</>;
};

export default AuthCheck;
