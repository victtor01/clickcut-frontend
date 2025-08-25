export interface Booking {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  status: BookingStatus;
}

export enum BookingStatus {
  CREATED,
  PENDING,
  CONFIRMED,
  IN_PROGRESS,
  COMPLETED,
  PAID,
  CANCELLED,
  NO_SHOW,
}
