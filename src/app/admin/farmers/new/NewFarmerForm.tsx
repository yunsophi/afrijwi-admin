"use client";

import { useActionState } from "react";
import { createFarmer } from "@/lib/actions/admin";
import { FarmerFormFields } from "@/components/FarmerFormFields";

export function NewFarmerForm() {
  const [state, formAction, pending] = useActionState(createFarmer, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5">
      <FarmerFormFields />

      {state?.error && (
        <p className="rounded-lg bg-tone-danger-bg px-3 py-2 text-sm text-tone-danger-text">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add Farmer"}
      </button>
    </form>
  );
}
