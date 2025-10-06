import { Booking } from "../models/Booking";

export interface SummaryAround {
	pastBookings: Booking[];
	upcomingBookings: Booking[];
}
