"use client";

import { useActionState } from "react";
import { updateCaseStatus } from "@/lib/actions/admin";
import { CASE_STATUS_LABELS } from "@/lib/constants";

export function CaseStatusForm({ caseId, currentStatus }: { caseId: string; currentStatus: string }) {
  const [state, formAction, pending] = useActionState(updateCaseStatus, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="caseId" value={caseId} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Status</label>
        <select
          name="status"
          defaultValue={currentStatus}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {Object.entries(CASE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update Status"}
      </button>
      {state?.success && (
        <span className="text-sm text-tone-success-text">Saved.</span>
      )}
    </form>
  );
}
