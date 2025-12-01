export interface PaymentMethod {
	id: string; // Guid
	lastFourDigits: string;
	brand: string; // visa, master
	holderName: string;
	expirationMonth: number;
	expirationYear: number;
	userId?: string | null; // Guid
	clientAccountId?: string | null; // Guid
}