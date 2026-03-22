  import React from 'react';                                                                                                                                                         
  import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';                                                                                                             
  import { Badge } from '../ui/badge';                                                                                                                                               
  import { Button } from '../ui/button';                                                                                                                                             
  import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';                                                                                                                
  import { formatDistanceToNow } from 'date-fns';                                                                                                                                    
  import { HelpRequestMatch } from '../../types/helpRequest';                                                                                                                        
  import { Skeleton } from '../ui/skeleton';                                                                                                                                         
  import { updateApplicationStatus } from '../../integrations/supabase/helpRequestsApplications';                                                                                    
  import { supabase } from '../../integrations/supabase/client';                                                                                                                     
  import { toast } from 'sonner';                                                                                                                                                    
                                                                                                                                                                                     
  interface DeveloperApplicationsPanelProps {                                                                                                                                        
    applications: HelpRequestMatch[];                                                                                                                                                
    ticketId: string;                                                                                                                                                                
    clientId: string;                                                                                                                                                                
    isLoading?: boolean;                                                                                                                                                             
    onApplicationUpdate: () => void;                                                                                                                                                 
    onOpenChat?: (developerId: string, developerName?: string) => void;                                                                                                              
  }                                                                                                                                                                                  
                                                                                                                                                                                     
  const DeveloperApplicationsPanel: React.FC<DeveloperApplicationsPanelProps> = ({                                                                                                   
    applications,                                                                                                                                                                    
    ticketId,                                                                                                                                                                        
    clientId,                                                                                                                                                                        
    isLoading = false,                                                                                                                                                               
    onApplicationUpdate,                                                                                                                                                             
    onOpenChat                                                                                                                                                                       
  }) => {                                                                                                                                                                            
    const [processingApplicationIds, setProcessingApplicationIds] = React.useState<string[]>([]);                                                                                    
                                                                                                                                                                                     
    const handleApprove = async (applicationId: string) => {                                                                                                                         
      try {                                                                                                                                                                          
        setProcessingApplicationIds(prev => [...prev, applicationId]);                                                                                                               
        toast.loading('Approving application...');                                                                                                                                   
                                                                                                                                                                                     
        const application = applications.find(app => app.id === applicationId);                                                                                                      
        if (!application) {                                                                                                                                                          
          toast.dismiss();                                                                                                                                                           
          toast.error('Application not found');                                                                                                                                      
          return;                                                                                                                                                                    
        }                                                                                                                                                                            
                                                                                                                                                                                     
        const { error: approveError } = await supabase                                                                                                                               
          .from('help_request_matches')                                                                                                                                              
          .update({ status: 'approved' })                                                                                                                                            
          .eq('id', applicationId);                                                                                                                                                  
                                                                                                                                                                                     
        if (approveError) throw approveError;                                                                                                                                        
                                                                                                                                                                                     
        const { error: rejectError } = await supabase                                                                                                                                
          .from('help_request_matches')                                                                                                                                              
          .update({ status: 'rejected' })                                                                                                                                            
          .eq('request_id', ticketId)                                                                                                                                                
          .neq('id', applicationId)                                                                                                                                                  
          .in('status', ['pending']);                                                                                                                                                
                                                                                                                                                                                     
        if (rejectError) throw rejectError;                                                                                                                                          
                                                                                                                                                                                     
        const { error: ticketError } = await supabase                                                                                                                                
          .from('help_requests')                                                                                                                                                     
          .update({                                                                                                                                                                  
            status: 'in_progress',                                                                                                                                                   
            selected_developer_id: application.developer_id,
            in_progress_at: new Date().toISOString(),                                                                                                                                   
          })                                                                                                                                                                         
          .eq('id', ticketId);
                                                                                                                                                                                     
        if (ticketError) throw ticketError;                                                                                                                                          
                                                                                                                                                                                     
        toast.dismiss();                                                                                                                                                             
        toast.success('Developer application approved! Ticket is now in progress.');                                                                                                 
        onApplicationUpdate();                                                                                                                                                       
                                                                                                                                                                                     
      } catch (error: any) {
        toast.dismiss();                                                                                                                                                             
        const msg = error?.message || JSON.stringify(error) || 'Unknown error';
        toast.error(`Failed to approve application: ${msg}`);
        console.error('Error approving application:', error);                                                                                                                        
      } finally {                                                                                                                                                                    
        setProcessingApplicationIds(prev => prev.filter(id => id !== applicationId));                                                                                                
      }                                                                                                                                                                              
    };                                                                                                                                                                               
                                                                                                                                                                                     
    const handleReject = async (applicationId: string) => {                                                                                                                          
      try {                                                                                                                                                                          
        setProcessingApplicationIds(prev => [...prev, applicationId]);                                                                                                               
        toast.loading('Rejecting application...');                                                                                                                                   
                                                                                                                                                                                     
        const result = await updateApplicationStatus(                                                                                                                                
          applicationId,                                                                                                                                                             
          'rejected',                                                                                                                                                                
          clientId                                                                                                                                                                   
        );                                                                                                                                                                           
                                                                                                                                                                                     
        toast.dismiss();                                                                                                                                                             
                                                                                                                                                                                     
        if (result.success) {                                                                                                                                                        
          toast.success('Developer application rejected');                                                                                                                           
          onApplicationUpdate();                                                                                                                                                     
        } else {                                                                                                                                                                     
          toast.error(`Failed to reject application: ${result.error}`);                                                                                                              
        }                                                                                                                                                                            
      } catch (error) {                                                                                                                                                              
        toast.dismiss();                                                                                                                                                             
        toast.error('An error occurred while rejecting the application');                                                                                                            
        console.error('Error rejecting application:', error);                                                                                                                        
      } finally {                                                                                                                                                                    
        setProcessingApplicationIds(prev => prev.filter(id => id !== applicationId));                                                                                                
      }                                                                                                                                                                              
    };                                                                                                                                                                               
                                                                                                                                                                                     
    const isProcessing = (applicationId: string) => {                                                                                                                                
      return processingApplicationIds.includes(applicationId);                                                                                                                       
    };                                                                                                                                                                               
                                                                                                                                                                                     
    if (isLoading) {                                                                                                                                                                 
      return (                                                                                                                                                                       
        <Card>                                                                                                                                                                       
          <CardHeader>                                                                                                                                                               
            <CardTitle className="text-lg">Developer Applications</CardTitle>                                                                                                        
          </CardHeader>                                                                                                                                                              
          <CardContent>                                                                                                                                                              
            <div className="space-y-4">                                                                                                                                              
              <Skeleton className="h-12 w-full" />                                                                                                                                   
              <Skeleton className="h-12 w-full" />                                                                                                                                   
            </div>                                                                                                                                                                   
          </CardContent>                                                                                                                                                             
        </Card>                                                                                                                                                                      
      );                                                                                                                                                                             
    }                                                                                                                                                                                
                                                                                                                                                                                     
    if (!applications.length) {                                                                                                                                                      
      return (                                                                                                                                                                       
        <Card>                                                                                                                                                                       
          <CardHeader>                                                                                                                                                               
            <CardTitle className="text-lg">Developer Applications</CardTitle>                                                                                                        
          </CardHeader>                                                                                                                                                              
          <CardContent>                                                                                                                                                              
            <p className="text-muted-foreground text-sm">                                                                                                                            
              No developers have applied to this help request yet. Check back later.                                                                                                 
            </p>                                                                                                                                                                     
          </CardContent>                                                                                                                                                             
        </Card>                                                                                                                                                                      
      );                                                                                                                                                                             
    }                                                                                                                                                                                
                                                                                                                                                                                     
    const pendingApplications = applications.filter(app => app.status === 'pending');                                                                                                
    const approvedApplications = applications.filter(app => app.status === 'approved');                                                                                              
    const rejectedApplications = applications.filter(app => app.status === 'rejected');                                                                                              
                                                                                                                                                                                     
    return (                                                                                                                                                                         
      <Card>                                                                                                                                                                         
        <CardHeader className="pb-2">                                                                                                                                                
          <div className="flex items-center justify-between">                                                                                                                        
            <CardTitle className="text-lg">Developer Applications</CardTitle>                                                                                                        
            {pendingApplications.length > 0 && (                                                                                                                                     
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">                                                                                   
                {pendingApplications.length} Pending                                                                                                                                 
              </Badge>                                                                                                                                                               
            )}                                                                                                                                                                       
          </div>                                                                                                                                                                     
        </CardHeader>                                                                                                                                                                
        <CardContent>                                                                                                                                                                
          <div className="space-y-5">                                                                                                                                                
            {pendingApplications.length > 0 && (                                                                                                                                     
              <div>                                                                                                                                                                  
                <h3 className="text-sm font-medium mb-3">Pending Applications</h3>                                                                                                   
                <div className="space-y-3">                                                                                                                                          
                  {pendingApplications.map(application => (                                                                                                                          
                    <div                                                                                                                                                             
                      key={application.id}                                                                                                                                           
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/20 p-3 rounded-lg gap-3"                                                         
                    >                                                                                                                                                                
                      <div className="flex items-center space-x-3">                                                                                                                  
                        <Avatar>                                                                                                                                                     
                          <AvatarImage                                                                                                                                               
                            src={application.profiles?.image || ''}                                                                                                                  
                            alt={application.profiles?.name || 'Developer'}                                                                                                          
                          />                                                                                                                                                         
                          <AvatarFallback>{application.profiles ? (application.profiles.name || 'Dev').substring(0, 2) : 'Dev'}</AvatarFallback>                                     
                        </Avatar>                                                                                                                                                    
                        <div>                                                                                                                                                        
                          <p className="font-medium">{application.profiles?.name || 'Anonymous Developer'}</p>                                                                       
                          <p className="text-xs text-muted-foreground">                                                                                                              
                            Applied {application.created_at ? formatDistanceToNow(new Date(application.created_at), { addSuffix: true }) : 'recently'}                               
                          </p>                                                                                                                                                       
                        </div>                                                                                                                                                       
                      </div>                                                                                                                                                         
                                                                                                                                                                                     
                      {application.proposed_message && (                                                                                                                             
                        <div className="border-l pl-3 hidden md:block flex-grow">                                                                                                    
                          <p className="text-xs italic line-clamp-2">&ldquo;{application.proposed_message}&rdquo;</p>                                                                
                        </div>                                                                                                                                                       
                      )}                                                                                                                                                             
                                                                                                                                                                                     
                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">                                                                                      
                        <Button                                                                                                                                                      
                          size="sm"                                                                                                                                                  
                          variant="destructive"                                                                                                                                      
                          onClick={() => handleReject(application.id!)}                                                                                                              
                          disabled={isProcessing(application.id!)}                                                                                                                   
                        >                                                                                                                                                            
                          Reject                                                                                                                                                     
                        </Button>                                                                                                                                                    
                        <Button                                                                                                                                                      
                          size="sm"                                                                                                                                                  
                          onClick={() => handleApprove(application.id!)}                                                                                                             
                          disabled={isProcessing(application.id!)}                                                                                                                   
                        >                                                                                                                                                            
                          Accept                                                                                                                                                     
                        </Button>                                                                                                                                                    
                      </div>                                                                                                                                                         
                    </div>                                                                                                                                                           
                  ))}                                                                                                                                                                
                </div>                                                                                                                                                               
              </div>                                                                                                                                                                 
            )}                                                                                                                                                                       
                                                                                                                                                                                     
            {approvedApplications.length > 0 && (                                                                                                                                    
              <div>                                                                                                                                                                  
                <h3 className="text-sm font-medium mb-3">Approved Developer</h3>                                                                                                     
                <div className="space-y-3">                                                                                                                                          
                  {approvedApplications.map(application => (                                                                                                                         
                    <div                                                                                                                                                             
                      key={application.id}                                                                                                                                           
                      className="flex items-center justify-between bg-green-50 p-3 rounded-lg"                                                                                       
                    >                                                                                                                                                                
                      <div className="flex items-center space-x-3">                                                                                                                  
                        <Avatar>                                                                                                                                                     
                          <AvatarImage                                                                                                                                               
                            src={application.profiles?.image || ''}                                                                                                                  
                            alt={application.profiles?.name || 'Developer'}                                                                                                          
                          />                                                                                                                                                         
                          <AvatarFallback>{application.profiles ? (application.profiles.name || 'Dev').substring(0, 2) : 'Dev'}</AvatarFallback>                                     
                        </Avatar>                                                                                                                                                    
                        <div>                                                                                                                                                        
                          <p className="font-medium">{application.profiles?.name || 'Anonymous Developer'}</p>                                                                       
                          <Badge variant="outline" className="text-xs text-green-700 bg-green-50 border-green-200">                                                                  
                            Approved                                                                                                                                                 
                          </Badge>                                                                                                                                                   
                        </div>                                                                                                                                                       
                      </div>                                                                                                                                                         
                    </div>                                                                                                                                                           
                  ))}                                                                                                                                                                
                </div>                                                                                                                                                               
              </div>                                                                                                                                                                 
            )}                                                                                                                                                                       
                                                                                                                                                                                     
            {rejectedApplications.length > 0 && (                                                                                                                                    
              <details className="text-sm">                                                                                                                                          
                <summary className="font-medium cursor-pointer">                                                                                                                     
                  Rejected Applications ({rejectedApplications.length})                                                                                                              
                </summary>                                                                                                                                                           
                <div className="space-y-3 mt-3">                                                                                                                                     
                  {rejectedApplications.map(application => (                                                                                                                         
                    <div                                                                                                                                                             
                      key={application.id}                                                                                                                                           
                      className="flex items-center justify-between bg-muted/10 p-3 rounded-lg"                                                                                       
                    >                                                                                                                                                                
                      <div className="flex items-center space-x-3">                                                                                                                  
                        <Avatar>                                                                                                                                                     
                          <AvatarImage                                                                                                                                               
                            src={application.profiles?.image || ''}                                                                                                                  
                            alt={application.profiles?.name || 'Developer'}                                                                                                          
                          />                                                                                                                                                         
                          <AvatarFallback>{application.profiles ? (application.profiles.name || 'Dev').substring(0, 2) : 'Dev'}</AvatarFallback>                                     
                        </Avatar>                                                                                                                                                    
                        <div>                                                                                                                                                        
                          <p className="font-medium">{application.profiles?.name || 'Anonymous Developer'}</p>                                                                       
                          <Badge variant="outline" className="text-xs text-red-700 bg-red-50 border-red-200">                                                                        
                            Rejected                                                                                                                                                 
                          </Badge>                                                                                                                                                   
                        </div>                                                                                                                                                       
                      </div>                                                                                                                                                         
                    </div>                                                                                                                                                           
                  ))}                                                                                                                                                                
                </div>                                                                                                                                                               
              </details>                                                                                                                                                             
            )}                                                                                                                                                                       
          </div>                                                                                                                                                                     
        </CardContent>                                                                                                                                                               
      </Card>                                                                                                                                                                        
    );                                                                                                                                                                               
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  export default DeveloperApplicationsPanel; 
