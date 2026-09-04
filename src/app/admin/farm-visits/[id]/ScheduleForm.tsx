"use client";

import { useActionState } from "react";
import { scheduleFarmVisit } from "@/lib/actions/admin";

export function ScheduleForm({ farmVisitId, defaultDate }: { farmVisitId: string; defaultDate?: string }) {
  const [state, formAction, pending] = useActionState(scheduleFarmVisit, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="farmVisitId" value={farmVisitId} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Proposed Date</label>
        <input
          type="date"
          name="proposedDate"
          defaultValue={defaultDate}
          className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Notes</label>
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
        {pending ? "Saving…" : "Confirm Schedule"}
      </button>
    </form>
  );
}
