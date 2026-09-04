import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  EXPERTISE_LABELS,
  VISIT_STATUS_LABELS,
  VISIT_STATUS_TONE_CLASSES,
  enumLabel,
  parseJsonArray,
} from "@/lib/constants";
import {
  startSearchingForVisit,
  assignFarmVisitTrainer,
  cancelFarmVisit,
} from "@/lib/actions/admin";
import { ScheduleForm } from "./ScheduleForm";
import { CompleteForm } from "./CompleteForm";

export default async function FarmVisitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const visit = await prisma.farmVisit.findUnique({
    where: { id },
    include: { case: { include: { farmer: true } }, assignedTrainer: true },
  });
  if (!visit) notFound();

  const requiredExpertise = parseJsonArray(visit.requiredExpertise ?? visit.case.requiredExpertise);

  // Candidates: Verified, can do Farm Visit, same District as the Case —
  // MVP uses District/Sector only, no GPS/distance calculation.
  const trainers = await prisma.trainer.findMany({
    where: { verificationStatus: "VERIFIED", district: visit.case.district },
    orderBy: { fullName: "asc" },
  });

  const candidates = await Promise.all(
    trainers
      .filter((t) => parseJsonArray(t.supportMethods).includes("FARM_VISIT"))
      .map(async (t) => {
        const activeCases = await prisma.trainerAssignment.count({
          where: { trainerId: t.id, status: "ACCEPTED", case: { status: { notIn: ["COMPLETED", "CANCELLED"] } } },
        });
        return { trainer: t, activeCases, expertise: parseJsonArray(t.expertise) };
      })
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Farm Visit</h1>
          <Link href={`/admin/cases/${visit.case.id}`} className="text-sm text-brand-600 hover:underline">
            {visit.case.title}
          </Link>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${VISIT_STATUS_TONE_CLASSES[visit.visitStatus]}`}
        >
          {VISIT_STATUS_LABELS[visit.visitStatus]}
        </span>
      </div>

      <Section title="Details">
        <p className="text-sm text-slate-700">
          Farmer Location: {visit.case.district}, {visit.case.sector}
          {visit.case.village ? `, ${visit.case.village}` : ""}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Required Expertise: {requiredExpertise.map((e) => enumLabel(EXPERTISE_LABELS, e)).join(", ") || "—"}
        </p>
        {visit.assignedTrainer && (
          <p className="mt-1 text-sm text-slate-700">
            Assigned Trainer:{" "}
            <Link href={`/admin/trainers/${visit.assignedTrainer.id}`} className="text-brand-600 hover:underline">
              {visit.assignedTrainer.fullName}
            </Link>
          </p>
        )}
        {visit.proposedDate && (
          <p className="mt-1 text-sm text-slate-700">
            Proposed Date: {new Date(visit.proposedDate).toLocaleDateString()}
          </p>
        )}
        {visit.completedDate && (
          <p className="mt-1 text-sm text-slate-700">
            Completed: {new Date(visit.completedDate).toLocaleDateString()}
          </p>
        )}
        {visit.notes && <p className="mt-1 text-sm text-slate-600">{visit.notes}</p>}
      </Section>

      {visit.visitStatus === "REQUIRED" && (
        <form action={startSearchingForVisit.bind(null, visit.id)}>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Start Searching for a Trainer
          </button>
        </form>
      )}

      {(visit.visitStatus === "SEARCHING" || visit.visitStatus === "REQUIRED") && (
        <Section title="Candidate Trainers">
          <p className="mb-3 text-xs text-slate-500">
            Same district, Verified, and able to do a Farm Visit. Sorted by expertise match.
          </p>
          <ul className="flex flex-col gap-2">
            {candidates.map((cand) => (
              <li key={cand.trainer.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-900">{cand.trainer.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {cand.expertise.map((e) => enumLabel(EXPERTISE_LABELS, e)).join(", ")} &middot; Active:{" "}
                    {cand.activeCases}/{cand.trainer.maxActiveCases}
                  </p>
                </div>
                <form action={assignFarmVisitTrainer.bind(null, visit.id, cand.trainer.id)}>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Select
                  </button>
                </form>
              </li>
            ))}
            {candidates.length === 0 && (
              <p className="text-sm text-slate-500">No Trainers in {visit.case.district} can currently do a Farm Visit.</p>
            )}
          </ul>
        </Section>
      )}

      {visit.visitStatus === "ASSIGNED" && (
        <Section title="Schedule the Visit">
          <ScheduleForm farmVisitId={visit.id} />
        </Section>
      )}

      {visit.visitStatus === "SCHEDULED" && (
        <Section title="Complete the Visit">
          <CompleteForm farmVisitId={visit.id} />
        </Section>
      )}

      {!["COMPLETED", "CANCELLED"].includes(visit.visitStatus) && (
        <form action={cancelFarmVisit.bind(null, visit.id)}>
          <button type="submit" className="text-sm text-tone-danger-text hover:underline">
            Cancel Farm Visit
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
