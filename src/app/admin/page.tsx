import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";

export default async function AdminDashboard() {
  const [
    newCount,
    waitingForTrainerCount,
    waitingForAdviceCount,
    waitingForReviewCount,
    activeCount,
    farmVisitCount,
    completedCount,
    recentCases,
  ] = await Promise.all([
    prisma.case.count({ where: { status: "NEW" } }),
    prisma.case.count({ where: { status: "MATCHING" } }),
    prisma.case.count({ where: { status: { in: ["SENT_TO_TRAINER", "ACCEPTED"] } } }),
    prisma.case.count({ where: { status: "AFRIJWI_REVIEW" } }),
    prisma.case.count({
      where: { status: { in: ["IN_PROGRESS", "ADVICE_SUBMITTED", "AFRIJWI_REVIEW"] } },
    }),
    prisma.farmVisit.count({ where: { visitStatus: { in: ["REQUIRED", "SEARCHING", "ASSIGNED", "SCHEDULED"] } } }),
    prisma.case.count({ where: { status: "COMPLETED" } }),
    prisma.case.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { farmer: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of the current Rwanda Pilot.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="New Requests" value={newCount} />
        <StatCard label="Waiting for Trainer" value={waitingForTrainerCount} />
        <StatCard label="Waiting for Advice" value={waitingForAdviceCount} />
        <StatCard label="Waiting for Admin Review" value={waitingForReviewCount} />
        <StatCard label="Active Cases" value={activeCount} />
        <StatCard label="Farm Visits" value={farmVisitCount} />
        <StatCard label="Completed Cases" value={completedCount} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Recent Cases</h2>
          <Link href="/admin/cases" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {recentCases.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/cases/${c.id}`}
                className="flex flex-col gap-1 px-5 py-3 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.title}</p>
                  <p className="text-xs text-slate-500">
                    {c.farmer.name} &middot; {c.district}, {c.sector}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            </li>
          ))}
          {recentCases.length === 0 && (
            <li className="px-5 py-6 text-sm text-slate-500">No Cases yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
