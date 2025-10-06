import { Client } from '../models/Client';

export interface ClientsSummaryResponse {
  summary: ClientsSummary[];
  clientsCount: number;
}

export interface ClientsSummary {
  client: Client;
  countOfBookings: number;
}