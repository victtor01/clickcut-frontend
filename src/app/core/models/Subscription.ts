export interface Subscription {
	id: string;
	planId: string;
	managerId: string;
	nextPaymentDate: string;
	status: SubscriptionStatus,
}

type SubscriptionStatus =
	| "Active"
	| "Pending" 
	| "PastDue"
	| "Cancelled"