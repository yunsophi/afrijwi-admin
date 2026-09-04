"use client";

import { useState } from "react";
import { reviewAdviceSendToFarmer, reviewAdviceRequestRevision } from "@/lib/actions/admin";

export function AdviceReviewActions({ adviceId }: { adviceId: string }) {
  const [mode, setMode] = useState<"idle" | "revision">("idle");

  if (mode === "revision") {
    return (
      <form action={reviewAdviceRequestRevision} className="mt-3 flex flex-col gap-2">
        <input type="hidden" name="adviceId" value={adviceId} />
        <textarea
          name="note"
          rows={2}
          placeholder="What should the Trainer revise?"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-medium text-white"
          >
            Send back to Trainer
          </button>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="rounded-lg px-4 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <form action={reviewAdviceSendToFarmer.bind(null, adviceId)}>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Send to Farmer
        </button>
      </form>
      <button
        type="button"
        onClick={() => setMode("revision")}
        className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        Request Revision
      </button>
    </div>
  );
}
