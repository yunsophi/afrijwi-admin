"use client";

import { useActionState } from "react";
import { completeFarmVisit } from "@/lib/actions/admin";

export function CompleteForm({ farmVisitId }: { farmVisitId: string }) {
  const [state, formAction, pending] = useActionState(completeFarmVisit, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="farmVisitId" value={farmVisitId} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Notes from the visit</label>
        <textarea name="notes" rows={2} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
      </div>
      {state?.success && (
        <p className="rounded-lg bg-tone-success-bg px-3 py-2 text-sm text-tone-success-text">Saved.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Mark Visit Completed"}
      </button>
    </form>
  );
}
