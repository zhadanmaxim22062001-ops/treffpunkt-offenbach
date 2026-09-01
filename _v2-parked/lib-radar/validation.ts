import { z } from "zod";
import { BRANCHEN } from "@/lib/members";

export const RADAR_CATEGORIES = ["rathaus", "baustelle", "foerderung", "frequenz", "stadt", "recht"] as const;
export const RADAR_URGENCIES = ["low", "mid", "high"] as const;
export const AUDIENCE_OPTIONS = [...BRANCHEN, "alle"] as const;

export const CATEGORY_LABELS: Record<(typeof RADAR_CATEGORIES)[number], string> = {
  rathaus: "Rathaus & Regeln",
  baustelle: "Baustellen",
  foerderung: "Förderung & Fristen",
  frequenz: "Frequenz-Kalender",
  stadt: "Stadt entwickelt sich",
  recht: "Recht & Kosten",
};

export const URGENCY_LABELS: Record<(typeof RADAR_URGENCIES)[number], string> = {
  low: "niedrig",
  mid: "mittel",
  high: "hoch",
};

/**
 * Shared by compose and edit. sourceName/sourceUrl are required here, not
 * just in the DB's NOT NULL — no item, from either origin, can be published
 * without both, and this is where that gets enforced before the DB ever
 * sees the request.
 */
export const itemFormSchema = z.object({
  category: z.enum(RADAR_CATEGORIES, { message: "Bitte eine Rubrik wählen." }),
  headlineDe: z.string().trim().min(5, "Bitte eine Überschrift eingeben.").max(200),
  summaryDe: z.string().trim().min(5, "Bitte eine Zusammenfassung eingeben."),
  actionDe: z.string().trim().min(5, "Bitte eintragen, was zu tun ist."),
  sourceName: z.string().trim().min(2, "Bitte den Namen der Quelle angeben."),
  sourceUrl: z.string().trim().url("Bitte einen gültigen Link zur Quelle angeben."),
  urgency: z.enum(RADAR_URGENCIES),
  // Empty string from a cleared <input type="date"> becomes null, not "" and
  // not undefined — Drizzle's .set() treats undefined as "leave this column
  // alone," which would silently fail to clear a previously-set deadline on
  // edit. null is an explicit "set this to NULL," which is what clearing the
  // field actually means.
  deadline: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  audience: z.array(z.string()).default([]),
  streets: z.array(z.string()).default([]),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

/** Parses a submitted <form>'s FormData into the shape itemFormSchema expects. */
export function parseItemFormData(formData: FormData) {
  return itemFormSchema.safeParse({
    category: formData.get("category"),
    headlineDe: formData.get("headlineDe"),
    summaryDe: formData.get("summaryDe"),
    actionDe: formData.get("actionDe"),
    sourceName: formData.get("sourceName"),
    sourceUrl: formData.get("sourceUrl"),
    urgency: formData.get("urgency"),
    deadline: formData.get("deadline"),
    audience: formData.getAll("audience"),
    streets: (formData.get("streets") as string | null)
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  });
}
