import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { session, error } = await getAuthSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.ActivityWhereInput = {
    userId: session!.user.id,
  };

  if (status) {
    where.status = status as Prisma.EnumActivityStatusFilter;
  }
  if (type) {
    where.type = type as Prisma.EnumActivityTypeFilter;
  }
  if (from || to) {
    where.scheduledDate = {};
    if (from) (where.scheduledDate as Prisma.DateTimeFilter).gte = new Date(from);
    if (to) (where.scheduledDate as Prisma.DateTimeFilter).lte = new Date(to);
  }

  const activities = await prisma.activity.findMany({
    where,
    orderBy: { scheduledDate: "asc" },
  });

  return NextResponse.json({ activities });
}
