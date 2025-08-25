import { User } from "./User";

export interface Business {
	id: string;
	name: string;
	owner?: User,
	timeZoneId?: string;
	revenueGoal?: string;
	isOpen?: boolean;
}

// public string Name { get; private set; } = string.Empty;
// 	public Guid Id { get; private set; }
// 	public User Owner { get; private set; } = null!;
// 	public Password? Password { get; private set; }
// 	public string TimeZoneId { get; private set; } = "Etc/UTC";
// 	public int RevenueGoal { get; private set; } = 0;
// 	public bool IsOpen { get; private set; } = false;