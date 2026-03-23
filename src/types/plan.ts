export interface PlanInput {
  chapterName: string;
  memberCount: number;
  interests: string;
  startDate: string; // ISO date string
}

export interface GeneratedActivity {
  type: "email" | "newsletter" | "social_event" | "milestone";
  title: string;
  description: string;
  scheduledDate: string; // ISO date string
}

export interface ActivityContext {
  type: string;
  title: string;
  description: string | null;
  chapterName?: string;
}
