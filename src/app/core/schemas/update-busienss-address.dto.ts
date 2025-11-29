export interface UpdateBusinessAddressDTO {
	cep: string;
	street: string;
	number: number;
	neighborhood: string;
	city: string;
	state: string;
	complement?: string;
}