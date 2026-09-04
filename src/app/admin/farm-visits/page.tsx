import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VISIT_STATUS_LABELS, VISIT_STATUS_TONE_CLASSES } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export default async function FarmVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const where: Prisma.FarmVisitWhereInput = status ? { visitStatus: status as never } : {};

  const visits = await prisma.farmVisit.findMany({
    where,
    include: { case: { include: { farmer: true } }, assignedTrainer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Farm Visits</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visits requested by Farmers or flagged as needed by a Trainer.
        </p>
      </div>

      <form className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
            <option value="">All</option>
            {Object.entries(VISIT_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="self-end rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-medium text-white">
          Filter
        </button>
        <Link href="/admin/farm-visits" className="self-end text-sm text-slate-500 hover:underline">
          Clear
        </Link>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {visits.map((v) => (
            <li key={v.id}>
              <Link
                href={`/admin/farm-visits/${v.id}`}
                className="flex flex-col gap-1 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{v.case.title}</p>
                  <p className="text-xs text-slate-500">
                    {v.case.farmer.name} &middot; {v.case.district}, {v.case.sector}
                    {v.assignedTrainer ? ` · ${v.assignedTrainer.fullName}` : ""}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${VISIT_STATUS_TONE_CLASSES[v.visitStatus]}`}
                >
                  {VISIT_STATUS_LABELS[v.visitStatus]}
                </span>
              </Link>
            </li>
          ))}
          {visits.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-500">No Farm Visits yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
