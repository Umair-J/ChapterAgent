"use client";

interface Filters {
  type: string;
  status: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        <option value="">All Types</option>
        <option value="email">Email</option>
        <option value="newsletter">Newsletter</option>
        <option value="social_event">Social Event</option>
        <option value="milestone">Milestone</option>
      </select>
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="skipped">Skipped</option>
      </select>
    </div>
  );
}
