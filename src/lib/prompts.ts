import { PlanInput, ActivityContext } from "@/types/plan";

export const PLAN_GENERATION_PROMPT = (input: PlanInput) => `You are an expert engagement strategist for fraternity/sorority chapters. Generate a 90-day engagement plan for the following chapter:

Chapter Name: ${input.chapterName}
Member Count: ${input.memberCount}
Interests/Focus Areas: ${input.interests}
Start Date: ${input.startDate}

Create 20-30 activities spread across the 90-day period. Each activity must have:
- type: one of "email", "newsletter", "social_event", "milestone"
- title: a concise, descriptive title
- description: a brief description of the activity's purpose and content
- scheduledDate: an ISO date string (YYYY-MM-DD) within the 90-day window

Guidelines:
- Start with a welcome email in the first few days
- Include at least 2-3 newsletters spread throughout
- Plan 4-6 social events at regular intervals
- Mark key milestones (30-day, 60-day, 90-day checkpoints)
- Mix activity types to keep engagement varied
- Space activities so there are 2-4 per week

Return ONLY a valid JSON array of activity objects. No markdown, no explanation, just the JSON array.`;

export const EMAIL_CONTENT_PROMPT = (ctx: ActivityContext) => `Write a professional, engaging email for a fraternity/sorority chapter.

Activity: ${ctx.title}
Purpose: ${ctx.description || "General chapter communication"}
${ctx.chapterName ? `Chapter: ${ctx.chapterName}` : ""}

Write the email body only (no subject line). Use a warm, inclusive tone appropriate for chapter members. Keep it concise but engaging. Include a clear call-to-action if appropriate.

Return only the email text, no markdown formatting.`;

export const NEWSLETTER_CONTENT_PROMPT = (ctx: ActivityContext) => `Write a chapter newsletter for a fraternity/sorority.

Topic: ${ctx.title}
Focus: ${ctx.description || "Chapter updates and news"}
${ctx.chapterName ? `Chapter: ${ctx.chapterName}` : ""}

Structure the newsletter with:
- A brief greeting/introduction
- 2-3 short sections with updates or highlights
- A closing with upcoming dates or calls to action

Keep the tone professional yet friendly. Return only the newsletter text.`;

export const SOCIAL_EVENT_CONTENT_PROMPT = (ctx: ActivityContext) => `Write an event invitation/description for a fraternity/sorority chapter event.

Event: ${ctx.title}
Details: ${ctx.description || "Chapter social event"}
${ctx.chapterName ? `Chapter: ${ctx.chapterName}` : ""}

Include:
- An engaging event description
- What attendees can expect
- Any preparation or items to bring (if applicable)
- An enthusiastic closing encouraging attendance

Keep it concise and energetic. Return only the invitation text.`;

export const MILESTONE_CONTENT_PROMPT = (ctx: ActivityContext) => `Write a milestone announcement for a fraternity/sorority chapter.

Milestone: ${ctx.title}
Context: ${ctx.description || "Chapter milestone achievement"}
${ctx.chapterName ? `Chapter: ${ctx.chapterName}` : ""}

Write a brief, celebratory announcement that:
- Acknowledges the milestone achievement
- Highlights progress and accomplishments
- Thanks members for their participation
- Looks ahead to what's next

Keep the tone celebratory and motivating. Return only the announcement text.`;

export const CONTENT_PROMPTS: Record<
  string,
  (ctx: ActivityContext) => string
> = {
  email: EMAIL_CONTENT_PROMPT,
  newsletter: NEWSLETTER_CONTENT_PROMPT,
  social_event: SOCIAL_EVENT_CONTENT_PROMPT,
  milestone: MILESTONE_CONTENT_PROMPT,
};
