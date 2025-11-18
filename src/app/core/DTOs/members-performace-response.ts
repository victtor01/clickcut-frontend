export interface DailyStatResponse {
  date: string;
  bookingCount: number;
}

export interface MemberPerformanceResponse {
  memberId: string;
  fullName: string;
  avatarUrl: string | null;
  roleName: string;
  revenue: number;
  totalBookings: number;
  dailyStats: DailyStatResponse[];
}