import { User } from './User';

export interface BusinessStatement {
  name: string;
  revenue: number;
  revenueGoal: number;
  userSession: User;
  count: {
    finished: number;
    canceled: number;
    noShow: number;
  };
}