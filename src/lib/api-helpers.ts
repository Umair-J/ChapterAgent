import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

/**
 * Get authenticated session or return 401 response.
 */
export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

/**
 * Get an activity owned by the current user, or return appropriate error response.
 */
export async function getOwnedActivity(activityId: string, userId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (!activity) {
    return { activity: null, error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  if (activity.userId !== userId) {
    return { activity: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { activity, error: null };
}
