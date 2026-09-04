"use client";

import { useActionState } from "react";
import { updateTrainerProfile } from "@/lib/actions/trainer";
import {
  TRAINER_TYPE_LABELS,
  EXPERTISE_LABELS,
  SUPPORT_METHOD_LABELS,
  RWANDA_DISTRICTS,
} from "@/lib/constants";
import type { Trainer } from "@prisma/client";

export function ProfileForm({
  trainer,
  expertise,
  supportMethods,
}: {
  trainer: Trainer;
  expertise: string[];
  supportMethods: string[];
}) {
  const [state, formAction, pending] = useActionState(updateTrainerProfile, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <Section title="Basic Information">
        <Grid>
          <TextField label="Full Name" name="fullName" defaultValue={trainer.fullName} required />
          <TextField label="Phone Number" name="phone" defaultValue={trainer.phone} required />
          <TextField label="WhatsApp Number" name="whatsapp" defaultValue={trainer.whatsapp} required />
          <TextField label="Email" name="email" type="email" defaultValue={trainer.email} required />
          <SelectField label="District" name="district" defaultValue={trainer.district} options={RWANDA_DISTRICTS} />
          <TextField label="Sector" name="sector" defaultValue={trainer.sector} required />
          <TextField
            label="Preferred Language"
            name="preferredLanguage"
            defaultValue={trainer.preferredLanguage}
          />
        </Grid>
      </Section>

      <Section title="Background">
        <Grid>
          <SelectField
            label="Trainer Type"
            name="trainerType"
            defaultValue={trainer.trainerType}
            options={Object.keys(TRAINER_TYPE_LABELS)}
            labels={TRAINER_TYPE_LABELS}
          />
          <TextField
            label="University / Organization"
            name="organization"
            defaultValue={trainer.organization ?? ""}
          />
          <TextField label="Field of Study" name="fieldOfStudy" defaultValue={trainer.fieldOfStudy ?? ""} />
          <TextField label="Occupation" name="occupation" defaultValue={trainer.occupation ?? ""} />
          <TextField
            label="Years of Experience"
            name="yearsExperience"
            type="number"
            defaultValue={trainer.yearsExperience ?? ""}
          />
        </Grid>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700">Experience Description</label>
          <textarea
            name="experienceDescription"
            rows={3}
            defaultValue={trainer.experienceDescription ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
      </Section>

      <Section title="Expertise" hint="Select all that apply.">
        <CheckboxGrid name="expertise" labels={EXPERTISE_LABELS} selected={expertise} />
      </Section>

      <Section title="Support Methods" hint="How can you support Farmers?">
        <CheckboxGrid name="supportMethods" labels={SUPPORT_METHOD_LABELS} selected={supportMethods} />
      </Section>

      {state?.error && (
        <p className="rounded-lg bg-tone-danger-bg px-3 py-2 text-sm text-tone-danger-text">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-tone-success-bg px-3 py-2 text-sm text-tone-success-text">
          Profile saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  labels,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        {options.map((value) => (
          <option key={value} value={value}>
            {labels ? labels[value] : value}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxGrid({
  name,
  labels,
  selected,
}: {
  name: string;
  labels: Record<string, string>;
  selected: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
      {Object.entries(labels).map(([value, label]) => (
        <label key={value} className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name={name}
            value={value}
            defaultChecked={selected.includes(value)}
          />
          {label}
        </label>
      ))}
    </div>
  );
}
