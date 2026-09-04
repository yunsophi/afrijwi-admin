import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { CASE_CATEGORY_LABELS, CASE_STATUS_LABELS, enumLabel } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; district?: string; trainerId?: string }>;
}) {
  const { status, category, district, trainerId } = await searchParams;

  const where: Prisma.CaseWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(category ? { category: category as never } : {}),
    ...(district ? { district } : {}),
    ...(trainerId ? { assignments: { some: { trainerId } } } : {}),
  };

  const [cases, trainers] = await Promise.all([
    prisma.case.findMany({
      where,
      include: { farmer: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.trainer.findMany({ orderBy: { fullName: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Requests / Cases</h1>
          <p className="mt-1 text-sm text-slate-500">All Farmer problems currently tracked.</p>
        </div>
        <Link
          href="/admin/cases/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + New Case
        </Link>
      </div>

      <form className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <FilterSelect name="status" label="Status" value={status} options={CASE_STATUS_LABELS} />
        <FilterSelect name="category" label="Category" value={category} options={CASE_CATEGORY_LABELS} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">District</label>
          <input
            name="district"
            defaultValue={district}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Trainer</label>
          <select
            name="trainerId"
            defaultValue={trainerId ?? ""}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="self-end rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-medium text-white"
        >
          Filter
        </button>
        <Link href="/admin/cases" className="self-end text-sm text-slate-500 hover:underline">
          Clear
        </Link>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {cases.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/cases/${c.id}`}
                className="flex flex-col gap-1 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.title}</p>
                  <p className="text-xs text-slate-500">
                    {c.farmer.name} &middot; {enumLabel(CASE_CATEGORY_LABELS, c.category)} &middot; {c.district}, {c.sector}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            </li>
          ))}
          {cases.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-500">No Cases match these filters.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function FilterSelect({
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
      <select
        name={name}
        defaultValue={value ?? ""}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
      >
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
