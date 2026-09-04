"use client";

import { useActionState, useState } from "react";
import { declineRequest, type ActionState } from "@/lib/actions/trainer";
import { DECLINE_REASON_LABELS } from "@/lib/constants";

async function action(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await declineRequest(formData);
  return undefined;
}

export function DeclineForm({ assignmentId }: { assignmentId: string }) {
  const [open, setOpen] = useState(false);
  const [, formAction, pending] = useActionState(action, undefined);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
      >
        Decline Request
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <div>
        <label className="text-sm font-medium text-slate-700">Reason (optional)</label>
        <select
          name="declineReason"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="">Select a reason…</option>
          {Object.entries(DECLINE_REASON_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Note (optional)</label>
        <textarea
          name="declineNote"
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-tone-danger-text px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Declining…" : "Confirm Decline"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
