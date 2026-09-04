"use client";

import { useActionState } from "react";
import { addFeedbackAndCompleteCase } from "@/lib/actions/admin";

const ADDRESSED_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "PARTIALLY", label: "Partially" },
  { value: "NO", label: "No" },
];

export function FeedbackForm({ caseId, trainerId }: { caseId: string; trainerId: string }) {
  const [state, formAction, pending] = useActionState(addFeedbackAndCompleteCase, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="caseId" value={caseId} />
      <input type="hidden" name="trainerId" value={trainerId} />

      <div>
        <p className="text-sm font-medium text-slate-700">Was the Farmer&rsquo;s problem addressed?</p>
        <div className="mt-2 flex gap-4">
          {ADDRESSED_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" name="addressed" value={opt.value} required />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Rating (optional)</label>
        <select name="rating" defaultValue="" className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">No rating</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({n})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Comment (optional)</label>
        <textarea name="comment" rows={2} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-tone-danger-bg px-3 py-2 text-sm text-tone-danger-text">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Feedback & Complete Case"}
      </button>
    </form>
  );
}
