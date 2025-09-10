export interface CreateServiceDTO {
	name: string;
	price: number;
	duration: number;
	description?: string;
	photo?: File | null;
}