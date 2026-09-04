"use client";

import { useActionState, useState } from "react";
import { submitAdvice } from "@/lib/actions/trainer";

export function AdviceForm({ caseId }: { caseId: string }) {
  const [state, formAction, pending] = useActionState(submitAdvice, undefined);
  const [farmVisitNeeded, setFarmVisitNeeded] = useState("NO");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="caseId" value={caseId} />

      <FormField label="1. Assessment / Understanding" hint="What do you think is causing this problem?">
        <textarea
          name="assessment"
          required
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </FormField>

      <FormField label="2. Recommended Action" hint="What should the Farmer do?">
        <textarea
          name="recommendedAction"
          required
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </FormField>

      <FormField label="3. Additional Questions" hint="Anything else worth confirming with the Farmer?">
        <textarea
          name="additionalQuestions"
          rows={2}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </FormField>

      <FormField label="4. Farm Visit" hint="Is a Farm Visit needed?">
        <div className="flex gap-4">
          {["NO", "MAYBE", "YES"].map((value) => (
            <label key={value} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="farmVisitNeeded"
                value={value}
                checked={farmVisitNeeded === value}
                onChange={() => setFarmVisitNeeded(value)}
              />
              {value === "NO" ? "No" : value === "MAYBE" ? "Maybe" : "Yes"}
            </label>
          ))}
        </div>
      </FormField>

      {farmVisitNeeded !== "NO" && (
        <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-4">
          <FormField label="5. Required Expertise for the Visit">
            <input
              name="farmVisitExpertise"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </FormField>
          <FormField label="Recommended Trainer Type">
            <input
              name="farmVisitTrainerType"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </FormField>
          <FormField label="Additional Instructions">
            <textarea
              name="farmVisitInstructions"
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </FormField>
        </div>
      )}

      <FormField label="6. Additional Notes">
        <textarea
          name="additionalNotes"
          rows={2}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </FormField>

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
        {pending ? "Submitting…" : "Submit Advice"}
      </button>
    </form>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      {children}
    </div>
  );
}
