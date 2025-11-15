import { Subscription } from "./Subscription";

export interface User {
  id: string;
	username: string;
	email: string;
	createdAt: string;
	photoUrl?: string;
	subscription?: Subscription;
}
