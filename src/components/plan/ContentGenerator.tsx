"use client";

import { useState } from "react";
import { Activity } from "./ActivityCard";

interface Props {
  activity: Activity;
  onContentUpdate: (id: string, content: string) => void;
}

export default function ContentGenerator({ activity, onContentUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(activity.generatedContent || "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/activities/${activity.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate content");
      }
      const data = await res.json();
      setContent(data.content);
      onContentUpdate(activity.id, data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generatedContent: content }),
      });
      if (res.ok) {
        setEditing(false);
        onContentUpdate(activity.id, content);
      }
    } catch {
      setError("Failed to save content");
    }
  };

  if (!content) {
    return (
      <div className="mt-3 border-t pt-3">
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Content"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t pt-3">
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            rows={6}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-2 whitespace-pre-wrap text-sm text-gray-700">{content}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              Edit Content
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? "Regenerating..." : "Regenerate"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
