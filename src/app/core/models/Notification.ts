export interface Notification {
  id: string;               // Guid em C#
  recipient: string;
  title: string;
  body: string;
  type: NotificationType;
  status: NotificationStatus;
  category: NotificationCategory;
  sentAt?: Date;
  actionPath?: string;
  isRead: boolean;
  metadata?: string;
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