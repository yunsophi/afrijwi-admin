"use client";

import { useActionState } from "react";
import { createCase } from "@/lib/actions/admin";
import { CASE_CATEGORY_LABELS, EXPERTISE_LABELS, RWANDA_DISTRICTS } from "@/lib/constants";
import type { Farmer } from "@prisma/client";

export function NewCaseForm({ farmers, defaultFarmerId }: { farmers: Farmer[]; defaultFarmerId?: string }) {
  const [state, formAction, pending] = useActionState(createCase, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Farmer</label>
        <select
          name="farmerId"
          required
          defaultValue={defaultFarmerId ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Select a Farmer…
          </option>
          {farmers.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} — {f.district}, {f.sector}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Category</label>
          <select
            name="category"
            defaultValue="OTHER"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {Object.entries(CASE_CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Urgency</label>
          <select
            name="urgency"
            defaultValue="NORMAL"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Title</label>
        <input
          name="title"
          required
          placeholder="Short summary, e.g. 'Cow has stopped eating'"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Detailed Description</label>
        <textarea
          name="description"
          required
          rows={3}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Farmer&rsquo;s Original Message</label>
        <textarea
          name="originalMessage"
          rows={2}
          placeholder="Optional — paste the Farmer's WhatsApp message"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">District</label>
          <select
            name="district"
            required
            defaultValue=""
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select…
            </option>
            {RWANDA_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Sector</label>
          <input name="sector" required className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Village (optional)</label>
          <input name="village" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">Required Expertise</p>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {Object.entries(EXPERTISE_LABELS).map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="requiredExpertise" value={v} />
              {l}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="farmVisitRequired" />
        Farm Visit likely required
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Preferred Trainer Location</label>
          <input name="preferredLocation" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Language Requirement</label>
          <input
            name="languageRequirement"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Other Requirements</label>
        <textarea
          name="otherRequirements"
          rows={2}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-tone-danger-bg px-3 py-2 text-sm text-tone-danger-text">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create Case"}
      </button>
    </form>
  );
}
