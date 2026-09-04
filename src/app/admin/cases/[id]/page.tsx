import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import {
  CASE_CATEGORY_LABELS,
  EXPERTISE_LABELS,
  VISIT_STATUS_LABELS,
  VISIT_STATUS_TONE_CLASSES,
  enumLabel,
  parseJsonArray,
} from "@/lib/constants";
import { markCaseCompleted, createFarmVisitForCase } from "@/lib/actions/admin";
import { AdviceReviewActions } from "./AdviceReviewActions";
import { EscalateForm } from "./EscalateForm";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [c, allTrainers] = await Promise.all([
    prisma.case.findUnique({
      where: { id },
      include: {
        farmer: true,
        assignments: { include: { trainer: true }, orderBy: { assignedAt: "asc" } },
        advices: { include: { trainer: true }, orderBy: { submittedAt: "asc" } },
        farmVisit: true,
        feedback: true,
      },
    }),
    prisma.trainer.findMany({ orderBy: { fullName: "asc" } }),
  ]);

  if (!c) notFound();

  const requiredExpertise = parseJsonArray(c.requiredExpertise);
  const pendingAssignment = c.assignments.find((a) => a.status === "SENT");
  const latestAdvice = c.advices[c.advices.length - 1];
  const needsMatching = ["NEW", "MATCHING", "DECLINED", "NO_RESPONSE"].includes(c.status) && !pendingAssignment;
  const otherTrainers = allTrainers
    .filter((t) => !c.assignments.some((a) => a.trainerId === t.id))
    .map((t) => ({ id: t.id, fullName: t.fullName, trainerType: t.trainerType }));
  const visitFlaggedByAdvice = c.advices.some((a) => a.farmVisitNeeded !== "NO");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Case #{c.id.slice(-6).toUpperCase()} &middot; {enumLabel(CASE_CATEGORY_LABELS, c.category)}
          </p>
        </div>
        <StatusBadge status={c.status} />
      </div>

      {/* Farmer — Admin sees full identity; this is never exposed to Trainers. */}
      <Section title="Farmer">
        <Link href={`/admin/farmers/${c.farmer.id}`} className="text-sm font-medium text-brand-600 hover:underline">
          {c.farmer.name}
        </Link>
        <p className="text-sm text-slate-600">
          {c.farmer.phone} &middot; {c.farmer.whatsapp} (WhatsApp)
        </p>
        <p className="text-sm text-slate-500">
          {c.district}, {c.sector}
          {c.village ? `, ${c.village}` : ""}
        </p>
      </Section>

      <Section title="Problem">
        <p className="text-sm text-slate-800">{c.description}</p>
        {c.originalMessage && (
          <p className="mt-2 text-xs italic text-slate-500">&ldquo;{c.originalMessage}&rdquo;</p>
        )}
        <p className="mt-2 text-xs text-slate-500">Urgency: {c.urgency}</p>
      </Section>

      <Section title="Matching Requirements">
        <p className="text-sm text-slate-700">
          Expertise: {requiredExpertise.map((e) => enumLabel(EXPERTISE_LABELS, e)).join(", ") || "—"}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Farm Visit: {c.farmVisitRequired ? "Likely required" : "Not indicated"}
        </p>
        {c.languageRequirement && (
          <p className="mt-1 text-sm text-slate-700">Language: {c.languageRequirement}</p>
        )}
      </Section>

      {needsMatching && (
        <Link
          href={`/admin/matching/${c.id}`}
          className="self-start rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Find a Trainer →
        </Link>
      )}

      <Section title="Trainer Assignments">
        <ul className="flex flex-col gap-2">
          {c.assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm">
              <Link href={`/admin/trainers/${a.trainerId}`} className="text-slate-800 hover:underline">
                {a.trainer.fullName}
              </Link>
              <span className="text-xs text-slate-500">
                {a.status}
                {a.declineReason ? ` — ${a.declineReason}` : ""}
              </span>
            </li>
          ))}
          {c.assignments.length === 0 && <p className="text-sm text-slate-500">No Trainer assigned yet.</p>}
        </ul>
      </Section>

      {c.advices.length > 0 && (
        <Section title="Advice">
          {c.advices.map((advice) => (
            <div key={advice.id} className="mb-4 border-b border-slate-100 pb-4 last:mb-0 last:border-0 last:pb-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                From {advice.trainer.fullName}
              </p>
              <p className="mt-1 text-sm text-slate-800">
                <span className="font-medium">Assessment:</span> {advice.assessment}
              </p>
              <p className="mt-1 text-sm text-slate-800">
                <span className="font-medium">Recommended Action:</span> {advice.recommendedAction}
              </p>
              {advice.additionalQuestions && (
                <p className="mt-1 text-sm text-slate-800">
                  <span className="font-medium">Additional Questions:</span> {advice.additionalQuestions}
                </p>
              )}
              <p className="mt-1 text-sm text-slate-800">
                <span className="font-medium">Farm Visit Needed:</span> {advice.farmVisitNeeded}
              </p>
              <p className="mt-2 text-xs text-slate-500">Review status: {advice.adminReviewStatus}</p>

              {advice.id === latestAdvice.id && advice.adminReviewStatus === "PENDING" && (
                <>
                  <AdviceReviewActions adviceId={advice.id} />
                  <div className="mt-2">
                    <EscalateForm caseId={c.id} candidates={otherTrainers} />
                  </div>
                </>
              )}
            </div>
          ))}
        </Section>
      )}

      {c.farmVisit ? (
        <Section title="Farm Visit">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-700">
              Status: {VISIT_STATUS_LABELS[c.farmVisit.visitStatus]}
              {c.farmVisit.proposedDate && ` · ${new Date(c.farmVisit.proposedDate).toLocaleDateString()}`}
            </p>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${VISIT_STATUS_TONE_CLASSES[c.farmVisit.visitStatus]}`}
            >
              {VISIT_STATUS_LABELS[c.farmVisit.visitStatus]}
            </span>
          </div>
          <Link
            href={`/admin/farm-visits/${c.farmVisit.id}`}
            className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            Manage Farm Visit →
          </Link>
        </Section>
      ) : (
        (c.farmVisitRequired || visitFlaggedByAdvice) && (
          <form action={createFarmVisitForCase.bind(null, c.id)}>
            <button
              type="submit"
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Set Up Farm Visit
            </button>
          </form>
        )
      )}

      {c.status === "FARMER_SUPPORTED" && (
        <form action={markCaseCompleted.bind(null, c.id)}>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Mark Case Completed
          </button>
        </form>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-2 font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}
