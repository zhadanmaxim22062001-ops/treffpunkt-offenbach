"use client";

import { useActionState } from "react";
import { createManualItemAction, type FormActionState } from "@/app/admin/radar/actions";
import { ItemFormFields } from "@/components/admin/ItemFormFields";

const initialState: FormActionState = {};

export function ComposeForm() {
  const [state, formAction, pending] = useActionState(createManualItemAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <ItemFormFields errors={state.errors} />
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-accent px-6 py-5 font-display text-[16px] font-semibold text-white disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Wird gespeichert …" : "Als Entwurf speichern"}
      </button>
    </form>
  );
}
