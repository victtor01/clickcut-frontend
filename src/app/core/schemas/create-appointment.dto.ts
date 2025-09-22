export interface CreateAppointmentDTO {
  assignedToId: string;
  businessId: string;
  serviceIds: string[];
  startAt: string | Date;
  client: CreateAppointmentClientDTO;
}

export interface CreateAppointmentClientDTO {
  fullName: string;
  phoneNumber: string;
  email: string;
}
