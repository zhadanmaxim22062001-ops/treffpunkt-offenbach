import { createHash } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db, items } from "@/lib/db";
import type { ItemFormValues } from "@/lib/radar/validation";

export function hashSourceUrl(url: string): string {
  return createHash("sha256").update(url.trim().toLowerCase()).digest("hex");
}

export async function getDraftItems() {
  return db()
    .select()
    .from(items)
    .where(eq(items.status, "draft"))
    .orderBy(desc(items.createdAt));
}

export async function getRecentPublishedItems(limit = 10) {
  return db()
    .select()
    .from(items)
    .where(eq(items.status, "published"))
    .orderBy(desc(items.publishedAt))
    .limit(limit);
}

export async function getItemById(id: number) {
  const rows = await db().select().from(items).where(eq(items.id, id)).limit(1);
  return rows[0];
}

/**
 * Creates a manual draft. Always origin='manual', always status='draft' —
 * composing an item is not the same act as publishing it, even for a human
 * typing it directly; see /admin/radar/[id] for the separate publish step.
 */
export async function createManualItem(values: ItemFormValues) {
  const [row] = await db()
    .insert(items)
    .values({
      origin: "manual",
      status: "draft",
      urlHash: hashSourceUrl(values.sourceUrl),
      category: values.category,
      audience: values.audience,
      streets: values.streets,
      urgency: values.urgency,
      deadline: values.deadline,
      headlineDe: values.headlineDe,
      summaryDe: values.summaryDe,
      actionDe: values.actionDe,
      sourceName: values.sourceName,
      sourceUrl: values.sourceUrl,
    })
    .returning({ id: items.id });
  return row.id;
}

export async function updateItemFields(id: number, values: ItemFormValues) {
  await db()
    .update(items)
    .set({
      category: values.category,
      audience: values.audience,
      streets: values.streets,
      urgency: values.urgency,
      deadline: values.deadline,
      headlineDe: values.headlineDe,
      summaryDe: values.summaryDe,
      actionDe: values.actionDe,
      sourceName: values.sourceName,
      sourceUrl: values.sourceUrl,
    })
    .where(eq(items.id, id));
}

/** The publish gate. Requires sourceName/sourceUrl to already be non-empty — enforced by itemFormSchema before this is ever called. */
export async function publishItem(id: number) {
  await db()
    .update(items)
    .set({ status: "published", publishedAt: new Date() })
    .where(and(eq(items.id, id), eq(items.status, "draft")));
}

/** Rejected items are kept, never deleted — same principle as the classifier's rejected drafts: useful signal for later tuning. */
export async function rejectItem(id: number) {
  await db().update(items).set({ status: "rejected" }).where(eq(items.id, id));
}
