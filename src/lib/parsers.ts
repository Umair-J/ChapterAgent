import { GeneratedActivity } from "@/types/plan";

const VALID_TYPES = ["email", "newsletter", "social_event", "milestone"];

/**
 * Extract and parse JSON from an AI response that may contain markdown fences
 * or other surrounding text.
 */
export function extractJSON(raw: string): unknown {
  // Strategy 1: Direct parse
  try {
    return JSON.parse(raw);
  } catch {
    // continue
  }

  // Strategy 2: Strip markdown fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // continue
    }
  }

  // Strategy 3: Find first [ or { and last ] or }, extract substring
  const firstBracket = raw.search(/[\[{]/);
  if (firstBracket !== -1) {
    const opener = raw[firstBracket];
    const closer = opener === "[" ? "]" : "}";
    const lastBracket = raw.lastIndexOf(closer);
    if (lastBracket > firstBracket) {
      try {
        return JSON.parse(raw.substring(firstBracket, lastBracket + 1));
      } catch {
        // continue
      }
    }
  }

  throw new Error("Failed to extract valid JSON from AI response");
}

/**
 * Validate that parsed data is a valid array of GeneratedActivity objects.
 */
export function validateActivities(data: unknown): GeneratedActivity[] {
  if (!Array.isArray(data)) {
    throw new Error("Expected an array of activities");
  }

  return data.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Activity at index ${index} is not an object`);
    }

    const { type, title, description, scheduledDate } = item as Record<
      string,
      unknown
    >;

    if (!VALID_TYPES.includes(type as string)) {
      throw new Error(
        `Activity at index ${index} has invalid type: ${type}`
      );
    }

    if (typeof title !== "string" || !title.trim()) {
      throw new Error(`Activity at index ${index} is missing a title`);
    }

    if (typeof scheduledDate !== "string" || !scheduledDate.trim()) {
      throw new Error(
        `Activity at index ${index} is missing a scheduledDate`
      );
    }

    // Validate date format
    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      throw new Error(
        `Activity at index ${index} has invalid date: ${scheduledDate}`
      );
    }

    return {
      type: type as GeneratedActivity["type"],
      title: title.trim(),
      description:
        typeof description === "string" ? description.trim() : "",
      scheduledDate: date.toISOString(),
    };
  });
}
