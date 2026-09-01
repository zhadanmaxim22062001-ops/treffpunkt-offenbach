"use client";

import { useActionState } from "react";
import type { FormActionState } from "@/app/admin/radar/actions";
import { ItemFormFields } from "@/components/admin/ItemFormFields";

const initialState: FormActionState = {};

type DefaultValues = React.ComponentProps<typeof ItemFormFields>["defaultValues"];

export function EditForm({
  saveAction,
  publishAction,
  defaultValues,
}: {
  saveAction: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  publishAction: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  defaultValues: DefaultValues;
}) {
  const [saveState, saveFormAction, savePending] = useActionState(saveAction, initialState);
  const [publishState, publishFormAction, publishPending] = useActionState(publishAction, initialState);

  const errors = { ...saveState.errors, ...publishState.errors };
  const pending = savePending || publishPending;

  return (
    <form className="flex flex-col gap-8">
      <ItemFormFields defaultValues={defaultValues} errors={errors} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          formAction={saveFormAction}
          disabled={pending}
          className="w-full border px-6 py-5 font-display text-[16px] font-semibold disabled:opacity-60 sm:w-auto"
          style={{ borderColor: "var(--c-line)" }}
        >
          {savePending ? "Wird gespeichert …" : "Speichern"}
        </button>
        <button
          type="submit"
          formAction={publishFormAction}
          disabled={pending}
          className="w-full bg-accent px-6 py-5 font-display text-[16px] font-semibold text-white disabled:opacity-60 sm:w-auto"
        >
          {publishPending ? "Wird veröffentlicht …" : "Veröffentlichen"}
        </button>
      </div>
    </form>
  );
}
