import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import {
  EXPERTISE_LABELS,
  SUPPORT_METHOD_LABELS,
  TRAINER_TYPE_LABELS,
  enumLabel,
  parseJsonArray,
} from "@/lib/constants";
import { VerificationForm } from "./VerificationForm";
import { PilotIncentiveForm } from "./PilotIncentiveForm";

export default async function TrainerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [trainer, pilotIncentive, assignments, activeCaseCount] = await Promise.all([
    prisma.trainer.findUnique({ where: { id } }),
    prisma.pilotIncentive.findUnique({ where: { trainerId: id } }),
    prisma.trainerAssignment.findMany({
      where: { trainerId: id },
      include: { case: true },
      orderBy: { assignedAt: "desc" },
    }),
    prisma.trainerAssignment.count({
      where: { trainerId: id, status: "ACCEPTED", case: { status: { notIn: ["COMPLETED", "CANCELLED"] } } },
    }),
  ]);

  if (!trainer) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{trainer.fullName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {enumLabel(TRAINER_TYPE_LABELS, trainer.trainerType)} &middot; {trainer.district}, {trainer.sector}
        </p>
      </div>

      <Section title="Profile">
        <p className="text-sm text-slate-700">
          {trainer.phone} &middot; {trainer.whatsapp} (WhatsApp) &middot; {trainer.email}
        </p>
        {trainer.organization && <p className="mt-1 text-sm text-slate-700">{trainer.organization}</p>}
        {trainer.experienceDescription && (
          <p className="mt-2 text-sm text-slate-600">{trainer.experienceDescription}</p>
        )}
        <p className="mt-3 text-sm text-slate-700">
          Expertise: {parseJsonArray(trainer.expertise).map((e) => enumLabel(EXPERTISE_LABELS, e)).join(", ")}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Support Methods:{" "}
          {parseJsonArray(trainer.supportMethods).map((m) => enumLabel(SUPPORT_METHOD_LABELS, m)).join(", ")}
        </p>
        <p className="mt-3 text-sm text-slate-700">
          Availability: {trainer.availability === "AVAILABLE" ? "Available" : "Temporarily Unavailable"} &middot;
          Active Cases: {activeCaseCount} / {trainer.maxActiveCases}
        </p>
      </Section>

      <Section title="Verification">
        <VerificationForm trainer={trainer} />
      </Section>

      <Section title="Pilot Participation Incentive">
        <PilotIncentiveForm trainerId={trainer.id} incentive={pilotIncentive} />
      </Section>

      <Section title="Case History">
        <ul className="flex flex-col gap-2">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm">
              <Link href={`/admin/cases/${a.case.id}`} className="text-slate-800 hover:underline">
                {a.case.title}
              </Link>
              <StatusBadge status={a.case.status} />
            </li>
          ))}
          {assignments.length === 0 && <p className="text-sm text-slate-500">No Cases yet.</p>}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-3 font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}
