
import React, { useEffect, useState } from 'react';
import Navbar from './navbar';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  console.log('Layout component rendering');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pageReady, setPageReady] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingAttempt, setLoadingAttempt] = useState(1);
  
  useEffect(() => {
    // Track page load status
    console.log('Layout mounting - setting up page');
    console.time('layout-ready');
    
    const readyTimeoutId = setTimeout(() => {
      setPageReady(true);
      console.log('Layout ready - page fully loaded');
      console.timeEnd('layout-ready');
    }, 100);
    
    // Add a timeout with retries to prevent infinite loading
    const loadingTimeoutId = setTimeout(() => {
      if (!pageReady) {
        console.warn(`Layout loading timeout reached (attempt ${loadingAttempt}) - extending timeout`);
        
        if (loadingAttempt < 3) {
          // Retry by extending the timeout
          setLoadingAttempt(prev => prev + 1);
          toast.info(`Still loading content... (attempt ${loadingAttempt}/3)`);
        } else {
          // After 3 attempts, show the timeout message
          console.warn('Layout loading timeout reached - forcing ready state after 3 attempts');
          setPageReady(true);
          setLoadingTimeout(true);
          toast.error("Content is taking longer than expected to load. Some features may be limited.", {
            duration: 7000,
          });
        }
      }
    }, loadingAttempt === 1 ? 10000 : 15000); // Increased from 5s to 10s/15s
    
    // Setup network status monitoring
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may not work properly.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearTimeout(readyTimeoutId);
      clearTimeout(loadingTimeoutId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      console.log('Layout unmounted');
    };
  }, [loadingAttempt, pageReady]);
  
  console.log('Layout render state', { pageReady, loadingTimeout, loadingAttempt });
  
  if (!pageReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <span className="text-xl font-medium">Loading...</span>
          </div>
          
          {loadingAttempt > 1 && (
            <p className="text-muted-foreground mt-4">
              {loadingAttempt === 2 ? 
                "Content is taking longer than expected. Please wait..." :
                "Still loading... Thank you for your patience."}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {!isOnline && (
        <div className="bg-amber-500 text-white text-center py-1 px-2 text-sm">
          You are currently offline. Limited functionality available.
        </div>
      )}
      
      {loadingTimeout && (
        <Alert className="rounded-none border-x-0 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800/30 mb-4">
          <AlertDescription className="text-center py-1">
            Some content is taking longer to load. Please wait or try refreshing the page.
          </AlertDescription>
        </Alert>
      )}
      
      <main className="flex-1">{children}</main>
      
      <footer className="py-6 md:py-10 px-6 border-t border-border/40">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <h3 className="text-lg font-semibold">ProdSupport</h3>
              <p className="text-sm text-muted-foreground text-center md:text-left">
                On-demand support from expert developers when you need it most.
              </p>
            </div>
            <div className="flex gap-6">
              <a href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </a>
              <a href="/search" className="text-sm text-muted-foreground hover:text-foreground">
                Developers
              </a>
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </a>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </a>
              <a href="mailto:hello@prod-support.com" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-6 text-center md:text-left text-sm text-muted-foreground">
            © {new Date().getFullYear()} ProdSupport. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
