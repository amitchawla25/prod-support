// SINGLE SOURCE OF TRUTH FOR ALL TICKET STATUSES                                                                                                                                  
  // Do not create status strings anywhere else in the codebase                                                                                                                      
                                                                                                                                                                                     
  export const TicketStatus = {                                                                                                                                                      
    OPEN: 'open',                                                                                                                                                                    
    AWAITING_CLIENT_APPROVAL: 'awaiting_client_approval',                                                                                                                            
    IN_PROGRESS: 'in_progress',                                                                                                                                                      
    READY_FOR_CLIENT_QA: 'ready_for_client_qa',                                                                                                                                      
    RESOLVED: 'resolved',                                                                                                                                                            
    REOPENED: 'reopened',                                                                                                                                                            
    CANCELLED_BY_CLIENT: 'cancelled_by_client',                                                                                                                                      
  } as const;                                                                                                                                                                        
                                                                                                                                                                                     
  export const MatchStatus = {                                                                                                                                                       
    PENDING: 'pending',                                                                                                                                                              
    APPROVED: 'approved',                                                                                                                                                            
    REJECTED: 'rejected',                                                                                                                                                            
  } as const;                                                                                                                                                                        
                                                                                                                                                                                     
  export type TicketStatusType = typeof TicketStatus[keyof typeof TicketStatus];                                                                                                     
  export type MatchStatusType = typeof MatchStatus[keyof typeof MatchStatus];                                                                                                        
                                                                                                                                                                                     
  // Human-readable labels                                                                                                                                                           
  export const TicketStatusLabels: Record<TicketStatusType, string> = {                                                                                                              
    [TicketStatus.OPEN]: 'Open',                                                                                                                                                     
    [TicketStatus.AWAITING_CLIENT_APPROVAL]: 'Awaiting Approval',                                                                                                                    
    [TicketStatus.IN_PROGRESS]: 'In Progress',                                                                                                                                       
    [TicketStatus.READY_FOR_CLIENT_QA]: 'Ready for Review',                                                                                                                          
    [TicketStatus.RESOLVED]: 'Resolved',                                                                                                                                             
    [TicketStatus.REOPENED]: 'Reopened',                                                                                                                                             
    [TicketStatus.CANCELLED_BY_CLIENT]: 'Cancelled',                                                                                                                                 
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  // Status colors for badges                                                                                                                                                        
  export const TicketStatusColors: Record<TicketStatusType, string> = {                                                                                                              
    [TicketStatus.OPEN]: 'bg-blue-200 text-blue-900 border border-blue-300',                                                                                                                                
    [TicketStatus.AWAITING_CLIENT_APPROVAL]: 'bg-yellow-200 text-yellow-900 border border-yellow-300',                                                                                                        
    [TicketStatus.IN_PROGRESS]: 'bg-purple-200 text-purple-900 border border-purple-300',                                                                                                                     
    [TicketStatus.READY_FOR_CLIENT_QA]: 'bg-orange-200 text-orange-900 border border-orange-300',                                                                                                             
    [TicketStatus.RESOLVED]: 'bg-green-200 text-green-900 border border-green-300',                                                                                                                          
    [TicketStatus.REOPENED]: 'bg-red-200 text-red-900 border border-red-300',                                                                                                                              
    [TicketStatus.CANCELLED_BY_CLIENT]: 'bg-gray-200 text-gray-900 border border-gray-300',                                                                                                                 
  };                                                              
