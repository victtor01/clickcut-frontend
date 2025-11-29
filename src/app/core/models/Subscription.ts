export interface Subscription {
	id: string;
	managerId: string;
	nextPaymentDate: string;
	planId: SubscriptionPlan;
	status: SubscriptionStatus,
}

export const subscriptionPlans = [
	"solo", "equipe", "pro"
]

export type SubscriptionPlan = "solo" | "equipe" | "pro"

export type SubscriptionStatus =
	| "Active"
	| "Pending" 
	| "PastDue"
	| "Cancelled"

export const IsValidPlan = (currPlan: SubscriptionPlan, required: SubscriptionPlan) => 
	subscriptionPlans.indexOf(currPlan) >= subscriptionPlans.indexOf(required);

