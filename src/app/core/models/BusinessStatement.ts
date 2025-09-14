import { User } from './User';

export interface BusinessStatement {
  name: string;
  revenue: number;
  revenueGoal: number;
  userSession: User;
  logoUrl?: string;
  bannerUrl?: string;
  count: {
    finished: number;
    canceled: number;
    noShow: number;
    paids: number;
  };
}
