export interface BusinessSetupItem {
	step: BusinessSetupStep;
	type: StepType;
}

export enum BusinessSetupStep {
	GeneralInfo = "GeneralInfo", // Nome, Handle
	Address = "Address",         // Endereço físico
	OperatingHours = "OperatingHours", // Horários
	Visuals = "Visuals",         // Logo, Banner
	Services = "Services"        // Pelo menos um serviço cadastrado
}

export enum StepType {
	CRITICAL = "CRITICAL",
	RECOMMENDED = "RECOMMENDED"
}