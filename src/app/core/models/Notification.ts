export interface Notification {
  id: string;               // Guid em C#
  recipient: string;
  title: string;
  body: string;
  type: NotificationType;
  status: NotificationStatus;
  category: NotificationCategory;
  sentAt?: Date;            // DateTime? em C#
  isRead: boolean;
  metadata?: string;        // string? em C#
}

// NotificationStatus.ts
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

// NotificationType.ts
export type NotificationType = 'PUSH' | 'EMAIL' | 'IN_APP';

export type NotificationCategory =
  | "INFO"           
  | "SUCCESS"        
  | "WARNING"        
  | "ERROR"          
  | "PAYMENT_RECEIVED"; 