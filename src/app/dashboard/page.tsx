import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [statusCounts, typeCounts, upcoming, total] = await Promise.all([
    prisma.activity.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.activity.groupBy({
      by: ["type"],
      where: { userId },
      _count: true,
    }),
    prisma.activity.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: "pending",
      },
      orderBy: { scheduledDate: "asc" },
      take: 10,
    }),
    prisma.activity.count({ where: { userId } }),
  ]);

  const stats = {
    total,
    pending: statusCounts.find((s) => s.status === "pending")?._count ?? 0,
    completed: statusCounts.find((s) => s.status === "completed")?._count ?? 0,
    skipped: statusCounts.find((s) => s.status === "skipped")?._count ?? 0,
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {session.user.name || session.user.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/plan"
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              View Plan
            </Link>
            <Link
              href="/plan/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Generate Plan
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Activities</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Skipped</p>
            <p className="text-2xl font-bold text-gray-500">{stats.skipped}</p>
          </div>
        </div>

        {/* Activity Type Breakdown */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">By Type</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {typeCounts.map((tc) => (
              <div key={tc.type} className="rounded-lg border bg-white p-3 shadow-sm">
                <p className="text-sm capitalize text-gray-500">
                  {tc.type.replace("_", " ")}
                </p>
                <p className="text-xl font-semibold">{tc._count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Activities */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Upcoming (Next 7 Days)</h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-500">No upcoming activities this week.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {activity.type.replace("_", " ")} &middot;{" "}
                      {new Date(activity.scheduledDate).toLocaleDateString(
                        "en-US",
                        { weekday: "short", month: "short", day: "numeric" }
                      )}
                    </p>
                  </div>
                  <Link
                    href="/plan"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
