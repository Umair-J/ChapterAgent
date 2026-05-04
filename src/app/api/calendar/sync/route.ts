import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, getOwnedActivity } from "@/lib/api-helpers";
import { getCalendarClient } from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  const { session, error: authError } = await getAuthSession();
  if (authError) return authError;

  let body: { activityId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.activityId) {
    return NextResponse.json({ error: "activityId is required" }, { status: 400 });
  }

  const { activity, error } = await getOwnedActivity(body.activityId, session.user.id);
  if (error) return error;

  try {
    const calendar = await getCalendarClient(session.user.id);

    const eventBody = {
      summary: activity.title,
      description: activity.description || undefined,
      start: {
        date: new Date(activity.scheduledDate).toISOString().split("T")[0],
      },
      end: {
        date: new Date(activity.scheduledDate).toISOString().split("T")[0],
      },
    };

    let calendarEventId: string;

    if (activity.calendarEventId) {
      // Update existing event
      const res = await calendar.events.update({
        calendarId: "primary",
        eventId: activity.calendarEventId,
        requestBody: eventBody,
      });
      calendarEventId = res.data.id!;
    } else {
      // Create new event
      const res = await calendar.events.insert({
        calendarId: "primary",
        requestBody: eventBody,
      });
      calendarEventId = res.data.id!;
    }

    await prisma.activity.update({
      where: { id: activity.id },
      data: { calendarEventId },
    });

    return NextResponse.json({ calendarEventId });
  } catch (err: unknown) {
    console.error("Calendar sync error:", err);

    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 401) {
      return NextResponse.json(
        { error: "Google authorization expired. Please sign out and sign in again." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to sync with Google Calendar" },
      { status: 500 }
    );
  }
}
