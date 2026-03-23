import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { getAuthSession, getOwnedActivity } from "@/lib/api-helpers";
import { CONTENT_PROMPTS } from "@/lib/prompts";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { activity, error } = await getOwnedActivity(params.id, session!.user.id);
  if (error) return error;

  const promptFn = CONTENT_PROMPTS[activity!.type];
  if (!promptFn) {
    return NextResponse.json(
      { error: "Content generation not available for this activity type" },
      { status: 400 }
    );
  }

  let additionalContext = "";
  try {
    const body = await req.json();
    additionalContext = body.additionalContext || "";
  } catch {
    // No body is fine
  }

  try {
    let prompt = promptFn({
      type: activity!.type,
      title: activity!.title,
      description: activity!.description,
    });

    if (additionalContext) {
      prompt += `\n\nAdditional context from the user: ${additionalContext}`;
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content
      .filter((block) => block.type === "text")
      .map((block) => {
        if (block.type === "text") return block.text;
        return "";
      })
      .join("");

    // Store generated content
    await prisma.activity.update({
      where: { id: activity!.id },
      data: { generatedContent: content },
    });

    return NextResponse.json({ content });
  } catch (err: unknown) {
    console.error("Content generation error:", err);

    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 429) {
      return NextResponse.json(
        { error: "AI service is busy. Please try again in a moment." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
