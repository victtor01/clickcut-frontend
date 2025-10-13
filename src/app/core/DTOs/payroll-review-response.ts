import { Payout } from '../models/Payout';
import { User } from '../models/User';

export interface PayrollReviewResponse {
  payroll: Payout;
  user: User;
}
