export interface CreateAppointmentAttendeeDTO {
  assignedToId: string;
  businessId: string;
  serviceIds: string[];
	attendeeId: string;
  startAt: string | Date;
}