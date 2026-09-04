"use client";

import { useActionState } from "react";
import { updateTrainerPilotIncentive } from "@/lib/actions/admin";
import type { PilotIncentive } from "@prisma/client";

export function PilotIncentiveForm({
  trainerId,
  incentive,
}: {
  trainerId: string;
  incentive: PilotIncentive | null;
}) {
  const [state, formAction, pending] = useActionState(updateTrainerPilotIncentive, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="trainerId" value={trainerId} />

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="eligible" defaultChecked={incentive?.eligible ?? false} />
        Eligible for the Pilot Participation Incentive
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            defaultValue={incentive?.status ?? "NOT_ELIGIBLE"}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="NOT_ELIGIBLE">Not Eligible</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Amount (RWF)</label>
          <input
            type="number"
            name="amount"
            defaultValue={incentive?.amount ?? ""}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Separate from per-Case compensation below — this is the one-time Early Pilot incentive only.
        No Mobile Money integration yet; mark Paid manually once sent.
      </p>

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
