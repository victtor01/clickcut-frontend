export interface PaymentMethod {
	readonly id: string;
	lastFourDigits: string;
	isDefault: boolean;
	brand: string;
	holderName: string;
	expirationMonth: number;
	expirationYear: number;
	userId?: string | null;
	clientAccountId?: string | null; 
}