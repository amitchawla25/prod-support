 import React from 'react';                                                                                                                                                         
  import { useTicketApplications } from './useTicketApplications';                                                                                               
  import ApplicationCard from './ApplicationCard';                                                                                                                                   
                                                                                                                                                                                     
  interface TicketApplicationsSectionProps {                                                                                                                                         
    ticketId: string;                                                                                                                                                                
    isClient: boolean;                                                                                                                                                               
    ticketStatus?: string;                                                                                                                                                           
  }                                                                                                                                                                                  
                                                                                                                                                                                     
  export const TicketApplicationsSection: React.FC<TicketApplicationsSectionProps> = ({                                                                                              
    ticketId,                                                                                                                                                                        
    isClient,                                                                                                                                                                        
    ticketStatus                                                                                                                                                                     
  }) => {                                                                                                                                                                            
    const {                                                                                                                                                                          
      applications,                                                                                                                                                                  
      pendingApplications,                                                                                                                                                           
      isLoading,                                                                                                                                                                     
      error,                                                                                                                                                                         
      approveApplication,                                                                                                                                                            
      rejectApplication                                                                                                                                                              
    } = useTicketApplications(ticketId);                                                                                                                                             
                                                                                                                                                                                     
    if (isLoading) {                                                                                                                                                                 
      return (                                                                                                                                                                       
        <div className="bg-white rounded-lg p-8 shadow-sm">                                                                                                                          
          <div className="flex items-center justify-center">                                                                                                                         
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>                                                                                     
            <span className="ml-3 text-gray-600">Loading applications...</span>                                                                                                      
          </div>                                                                                                                                                                     
        </div>                                                                                                                                                                       
      );                                                                                                                                                                             
    }                                                                                                                                                                                
                                                                                                                                                                                     
    if (error) {                                                                                                                                                                     
      return (                                                                                                                                                                       
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">                                                                                                             
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Applications</h3>                                                                                            
          <p className="text-red-600">{error}</p>                                                                                                                                    
        </div>                                                                                                                                                                       
      );                                                                                                                                                                             
    }                                                                                                                                                                                
                                                                                                                                                                                     
    const approvedApplications = applications.filter(app => app.status === 'approved');                                                                                              
    const rejectedApplications = applications.filter(app => app.status === 'rejected');                                                                                              
                                                                                                                                                                                     
    return (                                                                                                                                                                         
      <div className="space-y-6">                                                                                                                                                    
        {/* Header */}                                                                                                                                                               
        <div className="bg-white rounded-lg p-6 shadow-sm">                                                                                                                          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Applications</h2>                                                                                                    
          <p className="text-gray-600">                                                                                                                                              
            {isClient                                                                                                                                                                
              ? 'Review and manage applications from developers interested in working on this ticket.'                                                                               
              : 'View the status of your application for this ticket.'}                                                                                                              
          </p>                                                                                                                                                                       
        </div>                                                                                                                                                                       
                                                                                                                                                                                     
        {/* No Applications */}                                                                                                                                                      
        {applications.length === 0 && (                                                                                                                                              
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">                                                                                             
            <svg                                                                                                                                                                     
              className="mx-auto h-12 w-12 text-gray-400 mb-4"                                                                                                                       
              fill="none"                                                                                                                                                            
              viewBox="0 0 24 24"                                                                                                                                                    
              stroke="currentColor"                                                                                                                                                  
            >                                                                                                                                                                        
              <path                                                                                                                                                                  
                strokeLinecap="round"                                                                                                                                                
                strokeLinejoin="round"                                                                                                                                               
                strokeWidth={2}                                                                                                                                                      
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0            
  01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"                                                                                                                                      
              />                                                                                                                                                                     
            </svg>                                                                                                                                                                   
            <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>                                                                                          
            <p className="text-gray-600">                                                                                                                                            
              {isClient                                                                                                                                                              
                ? 'When developers apply to work on this ticket, their applications will appear here.'                                                                               
                : 'No developers have applied to this ticket yet.'}                                                                                                                  
            </p>                                                                                                                                                                     
          </div>                                                                                                                                                                     
        )}                                                                                                                                                                           
                                                                                                                                                                                     
        {/* Pending Applications */}                                                                                                                                                 
        {pendingApplications.length > 0 && (                                                                                                                                         
          <div>                                                                                                                                                                      
            <div className="mb-4 flex items-center gap-2">                                                                                                                           
              <h3 className="text-xl font-semibold text-gray-900">                                                                                                                   
                Pending Applications                                                                                                                                                 
              </h3>                                                                                                                                                                  
              <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full">                                                                        
                {pendingApplications.length}                                                                                                                                         
              </span>                                                                                                                                                                
            </div>                                                                                                                                                                   
            <div className="space-y-4">                                                                                                                                              
              {pendingApplications.map((application) => (                                                                                                                            
                <ApplicationCard                                                                                                                                                     
                  key={application.id}                                                                                                                                               
                  application={application}                                                                                                                                          
                  onApprove={approveApplication}                                                                                                                                     
                  onReject={rejectApplication}                                                                                                                                       
                  isClient={isClient}                                                                                                                                                
                />                                                                                                                                                                   
              ))}                                                                                                                                                                    
            </div>                                                                                                                                                                   
          </div>                                                                                                                                                                     
        )}                                                                                                                                                                           
                                                                                                                                                                                     
        {/* Approved Applications */}                                                                                                                                                
        {approvedApplications.length > 0 && (                                                                                                                                        
          <div>                                                                                                                                                                      
            <div className="mb-4 flex items-center gap-2">                                                                                                                           
              <h3 className="text-xl font-semibold text-gray-900">                                                                                                                   
                Approved Applications                                                                                                                                                
              </h3>                                                                                                                                                                  
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">                                                                          
                {approvedApplications.length}                                                                                                                                        
              </span>                                                                                                                                                                
            </div>                                                                                                                                                                   
            <div className="space-y-4">                                                                                                                                              
              {approvedApplications.map((application) => (                                                                                                                           
                <ApplicationCard                                                                                                                                                     
                  key={application.id}                                                                                                                                               
                  application={application}                                                                                                                                          
                  onApprove={approveApplication}                                                                                                                                     
                  onReject={rejectApplication}                                                                                                                                       
                  isClient={isClient}                                                                                                                                                
                />                                                                                                                                                                   
              ))}                                                                                                                                                                    
            </div>                                                                                                                                                                   
          </div>                                                                                                                                                                     
        )}                                                                                                                                                                           
                                                                                                                                                                                     
        {/* Rejected Applications */}                                                                                                                                                
        {rejectedApplications.length > 0 && isClient && (                                                                                                                            
          <details className="bg-gray-50 rounded-lg">                                                                                                                                
            <summary className="cursor-pointer p-4 font-medium text-gray-700 hover:text-gray-900">                                                                                   
              Declined Applications ({rejectedApplications.length})                                                                                                                  
            </summary>                                                                                                                                                               
            <div className="p-4 pt-0 space-y-4">                                                                                                                                     
              {rejectedApplications.map((application) => (                                                                                                                           
                <ApplicationCard                                                                                                                                                     
                  key={application.id}                                                                                                                                               
                  application={application}                                                                                                                                          
                  onApprove={approveApplication}                                                                                                                                     
                  onReject={rejectApplication}                                                                                                                                       
                  isClient={isClient}                                                                                                                                                
                />                                                                                                                                                                   
              ))}                                                                                                                                                                    
            </div>                                                                                                                                                                   
          </details>                                                                                                                                                                 
        )}                                                                                                                                                                           
      </div>                                                                                                                                                                         
    );                                                                                                                                                                               
  };                           
