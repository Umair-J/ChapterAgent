import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DEV ONLY: Creates a test user and returns a session cookie bypass.
 * This route should never exist in production.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  // Upsert a test user
  const user = await prisma.user.upsert({
    where: { googleId: "dev-test-user" },
    update: {},
    create: {
      email: "testuser@chapter-agent.dev",
      name: "Test User",
      googleId: "dev-test-user",
      image: null,
      googleTokens: undefined,
    },
  });

  return NextResponse.json({ user });
}
