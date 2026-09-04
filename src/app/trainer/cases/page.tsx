import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentTrainer } from "@/lib/current-trainer";
import { StatusBadge } from "@/components/StatusBadge";
import { CASE_CATEGORY_LABELS, enumLabel } from "@/lib/constants";

export default async function TrainerActiveCasesPage() {
  const trainer = await requireCurrentTrainer();

  const assignments = await prisma.trainerAssignment.findMany({
    where: {
      trainerId: trainer.id,
      status: "ACCEPTED",
      case: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
    },
    include: { case: true },
    orderBy: { assignedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Active Cases</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cases you have accepted and are currently supporting.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {assignments.map((a) => (
            <li key={a.id}>
              <Link
                href={`/trainer/cases/${a.case.id}/advice`}
                className="flex flex-col gap-1 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{a.case.title}</p>
                  <p className="text-xs text-slate-500">
                    {enumLabel(CASE_CATEGORY_LABELS, a.case.category)} &middot; {a.case.district}, {a.case.sector}
                  </p>
                </div>
                <StatusBadge status={a.case.status} />
              </Link>
            </li>
          ))}
          {assignments.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-500">No active Cases.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
