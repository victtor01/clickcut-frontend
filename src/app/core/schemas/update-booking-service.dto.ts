export interface UpdateBookingServiceDTO {
	name: string;
	extraFee: number;
	discount: number;
	observation?: string | null;
}