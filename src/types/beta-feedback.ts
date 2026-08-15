export interface BetaFeedback {
  id: number;
  wedding_id: number;
  role: "couple" | "guest";
  trouble_items: string[];
  comments: string | null;
  email: string | null;
  created_at: string;
}
