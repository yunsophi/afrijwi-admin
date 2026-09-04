import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentTrainer } from "@/lib/current-trainer";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";

export default async function TrainerDashboard() {
  const trainer = await requireCurrentTrainer();

  const [newRequestCount, activeAssignments, completedCount] = await Promise.all([
    prisma.trainerAssignment.count({
      where: { trainerId: trainer.id, status: "SENT" },
    }),
    prisma.trainerAssignment.findMany({
      where: {
        trainerId: trainer.id,
        status: "ACCEPTED",
        case: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
      },
      include: { case: true },
      orderBy: { assignedAt: "desc" },
    }),
    prisma.trainerAssignment.count({
      where: { trainerId: trainer.id, case: { status: "COMPLETED" } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Welcome, {trainer.fullName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your Trainer dashboard for the Rwanda Pilot.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="New Requests" value={newRequestCount} />
        <StatCard label="Active Cases" value={activeAssignments.length} />
        <StatCard label="Completed Cases" value={completedCount} />
        <StatCard
          label="Capacity"
          value={activeAssignments.length}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">
          Availability:{" "}
          <span className="font-medium text-slate-900">
            {trainer.availability === "AVAILABLE" ? "Available" : "Temporarily Unavailable"}
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Current Active Cases:{" "}
          <span className="font-medium text-slate-900">
            {activeAssignments.length} / {trainer.maxActiveCases}
          </span>
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Active Cases</h2>
          <Link href="/trainer/cases" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {activeAssignments.map((a) => (
            <li key={a.id}>
              <Link
                href={`/trainer/cases/${a.case.id}/advice`}
                className="flex flex-col gap-1 px-5 py-3 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{a.case.title}</p>
                  <p className="text-xs text-slate-500">
                    {a.case.district}, {a.case.sector}
                  </p>
                </div>
                <StatusBadge status={a.case.status} />
              </Link>
            </li>
          ))}
          {activeAssignments.length === 0 && (
            <li className="px-5 py-6 text-sm text-slate-500">No active Cases right now.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
