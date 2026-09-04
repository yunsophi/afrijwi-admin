"use client";

import { useActionState } from "react";
import { updateFarmer } from "@/lib/actions/admin";
import { FarmerFormFields } from "@/components/FarmerFormFields";
import type { Farmer } from "@prisma/client";

export function EditFarmerForm({ farmer }: { farmer: Farmer }) {
  const [state, formAction, pending] = useActionState(updateFarmer, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5">
      <input type="hidden" name="id" value={farmer.id} />
      <FarmerFormFields farmer={farmer} />

      {state?.success && (
        <p className="rounded-lg bg-tone-success-bg px-3 py-2 text-sm text-tone-success-text">Saved.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
