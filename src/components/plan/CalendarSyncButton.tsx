"use client";

import { useState } from "react";

interface Props {
  activityId: string;
  calendarEventId: string | null;
  onSync: (id: string, calendarEventId: string | null) => void;
}

export default function CalendarSyncButton({
  activityId,
  calendarEventId,
  onSync,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSync = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to sync");
      }
      const data = await res.json();
      onSync(activityId, data.calendarEventId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/calendar/sync/${activityId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove");
      }
      onSync(activityId, null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      {calendarEventId ? (
        <button
          onClick={handleRemove}
          disabled={loading}
          className="rounded border border-orange-300 px-2 py-1 text-xs text-orange-700 hover:bg-orange-50 disabled:opacity-50"
        >
          {loading ? "..." : "Remove from Calendar"}
        </button>
      ) : (
        <button
          onClick={handleSync}
          disabled={loading}
          className="rounded border border-green-300 px-2 py-1 text-xs text-green-700 hover:bg-green-50 disabled:opacity-50"
        >
          {loading ? "Syncing..." : "Sync to Calendar"}
        </button>
      )}
    </div>
  );
}
