import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentTrainer } from "@/lib/current-trainer";
import { CASE_CATEGORY_LABELS, enumLabel } from "@/lib/constants";
import { AdviceForm } from "./AdviceForm";

export default async function AdviceSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trainer = await requireCurrentTrainer();

  // Ownership check — only a Trainer with an accepted assignment on this
  // Case may view or submit Advice for it.
  const assignment = await prisma.trainerAssignment.findFirst({
    where: { caseId: id, trainerId: trainer.id, status: "ACCEPTED" },
    include: { case: true },
  });

  if (!assignment) notFound();

  const { case: c } = assignment;
  const alreadySubmitted = c.status !== "IN_PROGRESS";

  const previousAdvice = alreadySubmitted
    ? await prisma.advice.findFirst({
        where: { caseId: c.id, trainerId: trainer.id },
        orderBy: { submittedAt: "desc" },
      })
    : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {enumLabel(CASE_CATEGORY_LABELS, c.category)} &middot; {c.district}, {c.sector}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Problem</p>
        <p className="mt-1 text-sm text-slate-800">{c.description}</p>
      </div>

      {alreadySubmitted && previousAdvice ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-900">
            Advice already submitted — awaiting AFRIJWI review.
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your Assessment
          </p>
          <p className="mt-1 text-sm text-slate-700">{previousAdvice.assessment}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your Recommended Action
          </p>
          <p className="mt-1 text-sm text-slate-700">{previousAdvice.recommendedAction}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <AdviceForm caseId={c.id} />
        </div>
      )}
    </div>
  );
}
