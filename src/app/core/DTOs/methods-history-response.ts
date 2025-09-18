import { BookingPaymentMethod } from "../models/BookingPayment";

export interface MethodHistoryDTO {
  methods: Record<BookingPaymentMethod, { count: number }>;
}
