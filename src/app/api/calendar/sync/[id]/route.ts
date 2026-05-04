import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, getOwnedActivity } from "@/lib/api-helpers";
import { getCalendarClient } from "@/lib/google-calendar";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { activity, error } = await getOwnedActivity(params.id, session.user.id);
  if (error) return error;

  if (!activity.calendarEventId) {
    return NextResponse.json(
      { error: "Activity is not synced to calendar" },
      { status: 400 }
    );
  }

  try {
    const calendar = await getCalendarClient(session.user.id);

    await calendar.events.delete({
      calendarId: "primary",
      eventId: activity.calendarEventId,
    });

    await prisma.activity.update({
      where: { id: activity.id },
      data: { calendarEventId: null },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Calendar delete error:", err);

    // If event already deleted from Google, just clear our reference
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 404) {
      await prisma.activity.update({
        where: { id: activity.id },
        data: { calendarEventId: null },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Failed to remove calendar event" },
      { status: 500 }
    );
  }
}
