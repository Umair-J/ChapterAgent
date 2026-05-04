import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-helpers";
import { PLAN_GENERATION_PROMPT } from "@/lib/prompts";
import { extractJSON, validateActivities } from "@/lib/parsers";
import { PlanInput, GeneratedActivity } from "@/types/plan";
import { shouldUseMockAI, generateMockPlan } from "@/lib/mock-ai";

export async function POST(req: NextRequest) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  let body: PlanInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { chapterName, memberCount, interests, startDate } = body;
  if (!chapterName || !memberCount || !interests || !startDate) {
    return NextResponse.json(
      { error: "Missing required fields: chapterName, memberCount, interests, startDate" },
      { status: 400 }
    );
  }

  try {
    let activities: GeneratedActivity[];

    if (shouldUseMockAI()) {
      // Use mock data for testing without a valid API key
      activities = generateMockPlan(body);
    } else {
      // Real Anthropic API call
      const prompt = PLAN_GENERATION_PROMPT(body);
      let retries = 0;
      let parsed: GeneratedActivity[] | undefined;

      while (retries < 2) {
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: retries === 0
                ? prompt
                : prompt + "\n\nIMPORTANT: Return ONLY valid JSON array. No markdown, no explanation.",
            },
          ],
        });

        const text = message.content
          .filter((block) => block.type === "text")
          .map((block) => {
            if (block.type === "text") return block.text;
            return "";
          })
          .join("");

        try {
          const raw = extractJSON(text);
          parsed = validateActivities(raw);
          break;
        } catch (parseError) {
          retries++;
          if (retries >= 2) {
            console.error("Failed to parse AI response after retries:", parseError);
            return NextResponse.json(
              { error: "Failed to generate plan. Please try again." },
              { status: 500 }
            );
          }
        }
      }

      if (!parsed) {
        return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
      }
      activities = parsed;
    }

    // Bulk insert activities
    const created = await prisma.activity.createMany({
      data: activities.map((a) => ({
        userId: session.user.id,
        type: a.type,
        title: a.title,
        description: a.description,
        scheduledDate: new Date(a.scheduledDate),
      })),
    });

    // Fetch back the created activities to return them
    const result = await prisma.activity.findMany({
      where: { userId: session.user.id },
      orderBy: { scheduledDate: "asc" },
    });

    return NextResponse.json({ activities: result, count: created.count });
  } catch (err: unknown) {
    console.error("Plan generation error:", err);

    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 429) {
      return NextResponse.json(
        { error: "AI service is busy. Please try again in a moment." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
