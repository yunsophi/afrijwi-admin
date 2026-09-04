import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  EXPERTISE_LABELS,
  TRAINER_TYPE_LABELS,
  enumLabel,
  parseJsonArray,
} from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export default async function TrainersPage({
  searchParams,
}: {
  searchParams: Promise<{
    expertise?: string;
    district?: string;
    trainerType?: string;
    verificationStatus?: string;
    availability?: string;
  }>;
}) {
  const { expertise, district, trainerType, verificationStatus, availability } = await searchParams;

  const where: Prisma.TrainerWhereInput = {
    ...(expertise ? { expertise: { contains: expertise } } : {}),
    ...(district ? { district } : {}),
    ...(trainerType ? { trainerType: trainerType as never } : {}),
    ...(verificationStatus ? { verificationStatus: verificationStatus as never } : {}),
    ...(availability ? { availability: availability as never } : {}),
  };

  const trainers = await prisma.trainer.findMany({
    where,
    orderBy: { fullName: "asc" },
    include: { _count: { select: { assignments: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Trainers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Agriculture students, professionals, and experienced farmers in the Pilot.
        </p>
      </div>

      <form className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <Select name="expertise" label="Expertise" value={expertise} options={EXPERTISE_LABELS} />
        <Select name="trainerType" label="Trainer Type" value={trainerType} options={TRAINER_TYPE_LABELS} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">District</label>
          <input name="district" defaultValue={district} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
        </div>
        <Select
          name="verificationStatus"
          label="Verification"
          value={verificationStatus}
          options={{ NOT_VERIFIED: "Not Verified", VERIFIED: "Verified", REJECTED: "Rejected" }}
        />
        <Select
          name="availability"
          label="Availability"
          value={availability}
          options={{ AVAILABLE: "Available", TEMPORARILY_UNAVAILABLE: "Temporarily Unavailable" }}
        />
        <button type="submit" className="self-end rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-medium text-white">
          Filter
        </button>
        <Link href="/admin/trainers" className="self-end text-sm text-slate-500 hover:underline">
          Clear
        </Link>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {trainers.map((t) => (
            <li key={t.id}>
              <Link
                href={`/admin/trainers/${t.id}`}
                className="flex flex-col gap-1 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t.fullName}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      ({enumLabel(TRAINER_TYPE_LABELS, t.trainerType)})
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {parseJsonArray(t.expertise).map((e) => enumLabel(EXPERTISE_LABELS, e)).join(", ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.district}, {t.sector}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <VerificationPill status={t.verificationStatus} />
                  <span className="text-xs text-slate-500">
                    {t.availability === "AVAILABLE" ? "Available" : "Unavailable"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
          {trainers.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-500">No Trainers match these filters.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <select name={name} defaultValue={value ?? ""} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
        <option value="">All</option>
        {Object.entries(options).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

function VerificationPill({ status }: { status: string }) {
  const classes =
    status === "VERIFIED"
      ? "bg-tone-success-bg text-tone-success-text"
      : status === "REJECTED"
      ? "bg-tone-danger-bg text-tone-danger-text"
      : "bg-tone-neutral-bg text-tone-neutral-text";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {status === "VERIFIED" ? "Verified" : status === "REJECTED" ? "Rejected" : "Not Verified"}
    </span>
  );
}
