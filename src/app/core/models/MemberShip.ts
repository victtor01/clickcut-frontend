import { Role } from './Role';
import { User } from './User';

export interface MemberShip {
  user: User;
  salary: number;
  roles: Role[];
  commissionRate: number;
}
