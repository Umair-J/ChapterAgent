import { GeneratedActivity } from "@/types/plan";
import { PlanInput } from "@/types/plan";

/**
 * Generate mock activities for testing without a valid Anthropic API key.
 * Set USE_MOCK_AI=true in .env.local to enable.
 */
export function shouldUseMockAI(): boolean {
  return process.env.USE_MOCK_AI === "true";
}

export function generateMockPlan(input: PlanInput): GeneratedActivity[] {
  const start = new Date(input.startDate);
  const activities: GeneratedActivity[] = [];

  const templates: Array<{ type: GeneratedActivity["type"]; title: string; description: string; dayOffset: number }> = [
    { type: "email", title: "Welcome Email", description: `Welcome all ${input.memberCount} members of ${input.chapterName} to the new engagement initiative.`, dayOffset: 1 },
    { type: "email", title: "Week 1 Check-In", description: "Follow up with members about their first impressions and gather initial feedback.", dayOffset: 5 },
    { type: "social_event", title: "Kickoff Social Mixer", description: `Casual meetup for ${input.chapterName} members to connect and discuss ${input.interests}.`, dayOffset: 7 },
    { type: "newsletter", title: "Monthly Newsletter #1", description: "First monthly newsletter covering upcoming events, member spotlights, and chapter news.", dayOffset: 14 },
    { type: "email", title: "Event Reminder", description: "Remind members about upcoming social events and volunteer opportunities.", dayOffset: 18 },
    { type: "social_event", title: "Community Service Day", description: `${input.chapterName} community service event focused on giving back to the local community.`, dayOffset: 21 },
    { type: "email", title: "Post-Event Follow-Up", description: "Thank participants and share highlights from the community service event.", dayOffset: 23 },
    { type: "milestone", title: "30-Day Milestone", description: `Celebrate one month of engagement! Review progress and achievements of ${input.chapterName}.`, dayOffset: 30 },
    { type: "email", title: "Member Spotlight Nominations", description: "Request nominations for outstanding members to feature in the next newsletter.", dayOffset: 33 },
    { type: "newsletter", title: "Monthly Newsletter #2", description: "Second newsletter featuring member spotlights, event recaps, and upcoming activities.", dayOffset: 38 },
    { type: "social_event", title: "Professional Development Workshop", description: `Workshop on leadership skills and professional growth for ${input.chapterName} members.`, dayOffset: 42 },
    { type: "email", title: "Mid-Quarter Update", description: "Share progress metrics, upcoming events, and opportunities for increased involvement.", dayOffset: 45 },
    { type: "social_event", title: "Social Outing", description: `Fun group outing for ${input.chapterName} — team building and bonding activities.`, dayOffset: 50 },
    { type: "email", title: "Volunteer Sign-Up", description: "Open registration for the next community service project.", dayOffset: 53 },
    { type: "milestone", title: "60-Day Milestone", description: `Two months in! Reflect on growth, participation rates, and member feedback.`, dayOffset: 60 },
    { type: "newsletter", title: "Monthly Newsletter #3", description: "Third newsletter with event highlights, member achievements, and final month preview.", dayOffset: 62 },
    { type: "social_event", title: "Guest Speaker Event", description: `Special guest speaker event aligned with ${input.chapterName}'s focus on ${input.interests}.`, dayOffset: 68 },
    { type: "email", title: "Final Month Kickoff", description: "Energize members for the final stretch with upcoming events and goals.", dayOffset: 70 },
    { type: "social_event", title: "End-of-Quarter Celebration", description: `Celebration event for ${input.chapterName} recognizing achievements and participation.`, dayOffset: 82 },
    { type: "email", title: "Survey & Feedback Request", description: "Gather member feedback on the 90-day engagement program for future improvements.", dayOffset: 85 },
    { type: "newsletter", title: "Final Newsletter & Recap", description: "Comprehensive recap of the 90-day engagement plan — highlights, stats, and what's next.", dayOffset: 88 },
    { type: "milestone", title: "90-Day Milestone — Program Complete!", description: `Congratulations to ${input.chapterName}! Full 90-day engagement plan completed. Review overall impact and plan next steps.`, dayOffset: 90 },
  ];

  for (const t of templates) {
    const date = new Date(start);
    date.setDate(date.getDate() + t.dayOffset);
    activities.push({
      type: t.type,
      title: t.title,
      description: t.description,
      scheduledDate: date.toISOString(),
    });
  }

  return activities;
}

export function generateMockContent(type: string, title: string, description: string | null): string {
  const desc = description || title;

  switch (type) {
    case "email":
      return `Dear Chapter Members,

We hope this message finds you well! We're writing to share an important update regarding: ${title}.

${desc}

This is a great opportunity for all of us to come together and strengthen our chapter community. Your participation and enthusiasm make all the difference.

Please don't hesitate to reach out if you have any questions or suggestions. We value your input and want to ensure everyone has a great experience.

Looking forward to connecting with you all!

Warm regards,
Chapter Leadership Team`;

    case "newsletter":
      return `📋 CHAPTER NEWSLETTER
━━━━━━━━━━━━━━━━━━━

${title}

Hello everyone! Welcome to this edition of our chapter newsletter.

📌 HIGHLIGHTS
${desc}

We've had an incredible period of growth and engagement. Our members continue to demonstrate outstanding commitment to our shared values and goals.

📅 UPCOMING EVENTS
• Check the chapter calendar for upcoming social events
• Volunteer sign-ups are open for our next service project
• Don't miss our monthly chapter meeting

💡 MEMBER SPOTLIGHT
This month we want to recognize all members who have been actively participating in our engagement activities. Your dedication inspires us all!

📞 STAY CONNECTED
Follow us on social media and check your email for the latest updates. Remember, your involvement makes our chapter stronger.

Until next time!
— The Chapter Newsletter Team`;

    case "social_event":
      return `🎉 YOU'RE INVITED!

${title}

${desc}

📅 Check your calendar for the scheduled date
📍 Location: TBD — details coming soon!

What to Expect:
• Great company and meaningful connections
• Fun activities and engaging conversations
• Refreshments provided

Please RSVP so we can plan accordingly. Bring your enthusiasm and a friend if they're interested in learning more about our chapter!

We can't wait to see you there!`;

    case "milestone":
      return `🏆 MILESTONE ACHIEVEMENT

${title}

${desc}

This is a moment to celebrate! We've reached an important milestone in our engagement journey, and it's all thanks to the dedication and energy of our amazing members.

Key Accomplishments:
• Strong participation across all activities
• Growing sense of community and connection
• Meaningful contributions to our shared goals

What's Next:
We'll continue building on this momentum. Stay tuned for exciting new activities and opportunities to get involved.

Thank you for being part of this incredible journey. Here's to even greater achievements ahead! 🎊`;

    default:
      return `Content for: ${title}\n\n${desc}`;
  }
}
