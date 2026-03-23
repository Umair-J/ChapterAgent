"use client";

import { StatusBadge, TypeBadge } from "./StatusBadge";

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  scheduledDate: string;
  status: string;
  generatedContent: string | null;
  calendarEventId: string | null;
}

interface Props {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function ActivityCard({
  activity,
  onEdit,
  onStatusChange,
  onDelete,
}: Props) {
  const date = new Date(activity.scheduledDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <TypeBadge type={activity.type} />
          <StatusBadge status={activity.status} />
        </div>
        <span className="text-sm text-gray-500">{date}</span>
      </div>

      <h3 className="mb-1 font-semibold">{activity.title}</h3>
      {activity.description && (
        <p className="mb-3 text-sm text-gray-600">{activity.description}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {activity.status === "pending" && (
          <button
            onClick={() => onStatusChange(activity.id, "completed")}
            className="rounded border border-green-300 px-2 py-1 text-xs text-green-700 hover:bg-green-50"
          >
            Mark Complete
          </button>
        )}
        {activity.status === "pending" && (
          <button
            onClick={() => onStatusChange(activity.id, "skipped")}
            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            Skip
          </button>
        )}
        <button
          onClick={() => onEdit(activity)}
          className="rounded border border-blue-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(activity.id)}
          className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
