export interface CreateAppointmentAttendeeDTO {
  assignedToId: string;
  businessId: string;
  serviceIds: string[];
  startAt: string | Date;
}