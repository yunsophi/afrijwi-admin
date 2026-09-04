"use client";

import { useState } from "react";
import { escalateCase } from "@/lib/actions/admin";

export function EscalateForm({
  caseId,
  candidates,
}: {
  caseId: string;
  candidates: { id: string; fullName: string; trainerType: string }[];
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        Escalate to Another Trainer
      </button>
    );
  }

  return (
    <form action={escalateCase} className="mt-3 flex flex-col gap-2 rounded-xl bg-slate-50 p-4">
      <input type="hidden" name="caseId" value={caseId} />
      <label className="text-sm font-medium text-slate-700">Escalate to</label>
      <select name="trainerId" required className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
        <option value="">Select a Trainer…</option>
        {candidates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.fullName}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-medium text-white">
          Escalate
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
