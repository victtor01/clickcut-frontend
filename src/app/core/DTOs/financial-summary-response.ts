export interface FinancialSummaryDTO {
	revenueToday: number;
	revenueLast7Days: number;
	revenueLast30Days: number;
	averageTicket30Days: number;
	pendingPaymentsCount: number;
	pendingPaymentsTotalAmount: number;
	pendingPaymentsList: PaymentSummaryDTO[];
}

export interface PaymentSummaryDTO {
	id: number;
	status: string | null;
	statusDetail: string | null;
	amount: number;
	description: string | null;
	dateCreated: Date | null;
	dateApproved: Date | null;
	payerEmail: string | null;
}