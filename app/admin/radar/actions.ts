"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import { parseItemFormData } from "@/lib/radar/validation";
import { createManualItem, publishItem, rejectItem, updateItemFields } from "@/lib/radar/queries";

export type FormActionState = {
  errors?: Record<string, string>;
};

function errorsFromZod(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

export async function createManualItemAction(_prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  const parsed = parseItemFormData(formData);
  if (!parsed.success) return { errors: errorsFromZod(parsed.error) };

  const id = await createManualItem(parsed.data);
  revalidatePath("/admin/radar");
  redirect(`/admin/radar/${id}`);
}

export async function saveItemAction(id: number, _prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  const parsed = parseItemFormData(formData);
  if (!parsed.success) return { errors: errorsFromZod(parsed.error) };

  await updateItemFields(id, parsed.data);
  revalidatePath("/admin/radar");
  revalidatePath(`/admin/radar/${id}`);
  return {};
}

/** The publish gate: same validation as save, then flips status. sourceName/sourceUrl are required fields in itemFormSchema, so publishing without them is rejected here before the DB is ever touched. */
export async function publishItemAction(id: number, _prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  const parsed = parseItemFormData(formData);
  if (!parsed.success) return { errors: errorsFromZod(parsed.error) };

  await updateItemFields(id, parsed.data);
  await publishItem(id);
  revalidatePath("/admin/radar");
  redirect("/admin/radar");
}

export async function rejectItemAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  await rejectItem(id);
  revalidatePath("/admin/radar");
  redirect("/admin/radar");
}
