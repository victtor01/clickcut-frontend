import { User } from './User';

export interface Invitation {
  id: string;
  inviter: User;
  inviteeEmail: string;
  status: InvitationStatus;
  expiresAt: Date;
  inviterId: string;
}

export enum InvitationStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Declined = 'Declined',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
}
