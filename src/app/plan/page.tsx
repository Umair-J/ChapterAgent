"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ActivityCard, { Activity } from "@/components/plan/ActivityCard";
import ActivityEditModal from "@/components/plan/ActivityEditModal";
import FilterBar from "@/components/plan/FilterBar";
import ContentGenerator from "@/components/plan/ContentGenerator";
import CalendarSyncButton from "@/components/plan/CalendarSyncButton";

export default function PlanPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ type: "", status: "" });

  const fetchActivities = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);

    const res = await fetch(`/api/activities?${params}`);
    if (res.ok) {
      const data = await res.json();
      setActivities(data.activities);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
    if (res.ok) {
      setActivities((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSave = async (id: string, data: Partial<Activity>) => {
    const res = await fetch(`/api/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
      );
    }
    setEditingActivity(null);
  };

  const handleContentUpdate = (id: string, content: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, generatedContent: content } : a
      )
    );
  };

  const handleCalendarSync = (id: string, calendarEventId: string | null) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, calendarEventId } : a))
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading plan...</p>
      </main>
    );
  }

  if (activities.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="mb-4 text-2xl font-bold">No Plan Yet</h1>
        <p className="mb-6 text-gray-600">Generate your first engagement plan to get started.</p>
        <Link
          href="/plan/new"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Create Plan
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Engagement Plan</h1>
          <Link
            href="/dashboard"
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id}>
              <div onClick={() => setExpandedId(expandedId === activity.id ? null : activity.id)}>
                <ActivityCard
                  activity={activity}
                  onEdit={setEditingActivity}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              </div>
              {expandedId === activity.id && (
                <div className="ml-4 mt-2 rounded-lg border bg-gray-50 p-4">
                  <ContentGenerator
                    activity={activity}
                    onContentUpdate={handleContentUpdate}
                  />
                  <div className="mt-3">
                    <CalendarSyncButton
                      activityId={activity.id}
                      calendarEventId={activity.calendarEventId}
                      onSync={handleCalendarSync}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {editingActivity && (
        <ActivityEditModal
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
