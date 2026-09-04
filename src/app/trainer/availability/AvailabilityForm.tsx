"use client";

import { useActionState } from "react";
import { updateAvailability } from "@/lib/actions/trainer";

export function AvailabilityForm({
  availability,
  maxActiveCases,
}: {
  availability: string;
  maxActiveCases: number;
}) {
  const [state, formAction, pending] = useActionState(updateAvailability, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <p className="text-sm font-semibold text-slate-800">Availability</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          {[
            { value: "AVAILABLE", label: "Available" },
            { value: "TEMPORARILY_UNAVAILABLE", label: "Temporarily Unavailable" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              <input
                type="radio"
                name="availability"
                value={opt.value}
                defaultChecked={availability === opt.value}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-800">Maximum Active Cases</label>
        <input
          type="number"
          name="maxActiveCases"
          min={0}
          max={20}
          defaultValue={maxActiveCases}
          className="mt-2 w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-slate-500">
          AFRIJWI will not assign you new Requests once your active Cases reach this number.
        </p>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-tone-danger-bg px-3 py-2 text-sm text-tone-danger-text">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-tone-success-bg px-3 py-2 text-sm text-tone-success-text">
          Saved.
        </p>
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
