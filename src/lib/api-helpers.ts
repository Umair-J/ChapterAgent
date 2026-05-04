import { getServerSession, Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { Activity } from "@prisma/client";

type AuthResult =
  | { session: Session & { user: { id: string } }; error: null }
  | { session: null; error: NextResponse };

type ActivityResult =
  | { activity: Activity; error: null }
  | { activity: null; error: NextResponse };

/**
 * Get authenticated session or return 401 response.
 */
export async function getAuthSession(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session: session as Session & { user: { id: string } }, error: null };
}

/**
 * Get an activity owned by the current user, or return appropriate error response.
 */
export async function getOwnedActivity(activityId: string, userId: string): Promise<ActivityResult> {
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
