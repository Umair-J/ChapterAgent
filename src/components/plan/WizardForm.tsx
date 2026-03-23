"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  chapterName: string;
  memberCount: string;
  interests: string;
  startDate: string;
}

export default function WizardForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    chapterName: "",
    memberCount: "",
    interests: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          memberCount: parseInt(form.memberCount, 10),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate plan");
      }

      router.push("/plan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-16 rounded-full ${
              s <= step ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Chapter Details</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Chapter Name</label>
            <input
              type="text"
              value={form.chapterName}
              onChange={(e) => updateField("chapterName", e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="e.g., Alpha Beta Chapter"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Member Count</label>
            <input
              type="number"
              value={form.memberCount}
              onChange={(e) => updateField("memberCount", e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="e.g., 50"
              min="1"
            />
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!form.chapterName || !form.memberCount}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Interests & Focus</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Interests & Focus Areas
            </label>
            <textarea
              value={form.interests}
              onChange={(e) => updateField("interests", e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              rows={4}
              placeholder="e.g., community service, academic excellence, social events, professional networking"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!form.interests}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Start Date</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Plan Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              disabled={loading}
              className="flex-1 rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating Plan..." : "Generate Plan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
