const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  skipped: "bg-gray-100 text-gray-600",
};

const TYPE_STYLES: Record<string, string> = {
  email: "bg-blue-100 text-blue-800",
  newsletter: "bg-purple-100 text-purple-800",
  social_event: "bg-pink-100 text-pink-800",
  milestone: "bg-amber-100 text-amber-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || "bg-gray-100"}`}
    >
      {status}
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const label = type.replace("_", " ");
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[type] || "bg-gray-100"}`}
    >
      {label}
    </span>
  );
}
