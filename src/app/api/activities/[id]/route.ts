import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, getOwnedActivity } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { activity, error } = await getOwnedActivity(params.id, session!.user.id);
  if (error) return error;

  return NextResponse.json(activity);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { activity, error } = await getOwnedActivity(params.id, session!.user.id);
  if (error) return error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Only allow updating specific fields
  const allowedFields = ["title", "description", "scheduledDate", "status", "generatedContent"];
  const data: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (field in body) {
      if (field === "scheduledDate") {
        data[field] = new Date(body[field] as string);
      } else {
        data[field] = body[field];
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.activity.update({
    where: { id: activity!.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error: authError } = await getAuthSession();
  if (authError) return authError;

  const { activity, error } = await getOwnedActivity(params.id, session!.user.id);
  if (error) return error;

  await prisma.activity.delete({ where: { id: activity!.id } });

  return NextResponse.json({ success: true });
}
