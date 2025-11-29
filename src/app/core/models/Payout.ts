export interface Payout {
  id: string;
  businessId: string;
  managerId: string;

  start: string; 
  end: string;

  baseSalary: number;
  totalCommission: number;
  totalAmount: number;

  status: 'PENDING' | 'PAID';
  paidAt?: string | null;

  proofOfPaymentUrl?: string | null;
}