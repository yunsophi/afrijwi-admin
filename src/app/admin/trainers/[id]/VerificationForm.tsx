"use client";

import { useActionState } from "react";
import { updateTrainerVerification } from "@/lib/actions/admin";
import type { Trainer } from "@prisma/client";

export function VerificationForm({ trainer }: { trainer: Trainer }) {
  const [state, formAction, pending] = useActionState(updateTrainerVerification, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="trainerId" value={trainer.id} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Application Status</label>
          <select
            name="applicationStatus"
            defaultValue={trainer.applicationStatus}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Verification Status</label>
          <select
            name="verificationStatus"
            defaultValue={trainer.verificationStatus}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="NOT_VERIFIED">Not Verified</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Admin Notes</label>
        <textarea
          name="adminNotes"
          rows={3}
          defaultValue={trainer.adminNotes ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      <p className="text-xs text-slate-500">
        &ldquo;Verified&rdquo; means AFRIJWI has reviewed this person&rsquo;s profile and experience and
        judged them suitable for the Pilot — it is not a formal certification.
      </p>

      {trainer.verificationDate && (
        <p className="text-xs text-slate-500">
          Last verified {new Date(trainer.verificationDate).toLocaleDateString()}
          {trainer.verifiedBy ? ` by ${trainer.verifiedBy}` : ""}
        </p>
      )}

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
