export type CrewRole = "staff" | "driver" | "vendor";

export interface CrewBroadcast {
  id: number;
  wedding_id: number;
  message: string;
  roles: CrewRole[];
  created_at: string;
}
