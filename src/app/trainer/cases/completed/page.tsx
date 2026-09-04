import { prisma } from "@/lib/prisma";
import { requireCurrentTrainer } from "@/lib/current-trainer";
import { CASE_CATEGORY_LABELS, enumLabel } from "@/lib/constants";

export default async function TrainerCompletedCasesPage() {
  const trainer = await requireCurrentTrainer();

  const assignments = await prisma.trainerAssignment.findMany({
    where: { trainerId: trainer.id, case: { status: "COMPLETED" } },
    include: { case: { include: { feedback: true } } },
    orderBy: { assignedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Completed Cases</h1>
        <p className="mt-1 text-sm text-slate-500">Your Case history.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {assignments.map((a) => (
            <li key={a.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{a.case.title}</p>
                <p className="text-xs text-slate-500">
                  {enumLabel(CASE_CATEGORY_LABELS, a.case.category)} &middot; {a.case.district}, {a.case.sector}
                </p>
              </div>
              {a.case.feedback ? (
                <span className="text-sm text-slate-500">
                  Feedback: {a.case.feedback.addressed}
                  {a.case.feedback.rating ? ` · ${a.case.feedback.rating}★` : ""}
                </span>
              ) : (
                <span className="text-sm text-slate-400">No feedback yet</span>
              )}
            </li>
          ))}
          {assignments.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-500">No completed Cases yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
