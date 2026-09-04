import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EXPERTISE_LABELS, enumLabel, parseJsonArray } from "@/lib/constants";
import { assignTrainerToCase } from "@/lib/actions/admin";

export default async function MatchingPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const c = await prisma.case.findUnique({ where: { id: caseId } });
  if (!c) notFound();

  const requiredExpertise = parseJsonArray(c.requiredExpertise);

  const [trainers, alreadyAssignedIds] = await Promise.all([
    prisma.trainer.findMany({
      where: { verificationStatus: "VERIFIED" },
      orderBy: { fullName: "asc" },
    }),
    prisma.trainerAssignment
      .findMany({ where: { caseId }, select: { trainerId: true } })
      .then((rows) => new Set(rows.map((r) => r.trainerId))),
  ]);

  // For each Trainer, count active Cases (accepted assignments on Cases not
  // yet Completed/Cancelled) to check capacity headroom.
  const candidates = await Promise.all(
    trainers.map(async (t) => {
      const activeCases = await prisma.trainerAssignment.count({
        where: { trainerId: t.id, status: "ACCEPTED", case: { status: { notIn: ["COMPLETED", "CANCELLED"] } } },
      });
      const expertise = parseJsonArray(t.expertise);
      const supportMethods = parseJsonArray(t.supportMethods);
      const matchesExpertise = expertise.some((e) => requiredExpertise.includes(e));
      const sameDistrict = t.district === c.district;
      const canFarmVisit = supportMethods.includes("FARM_VISIT");
      const atCapacity = activeCases >= t.maxActiveCases;

      return {
        trainer: t,
        expertise,
        activeCases,
        matchesExpertise,
        sameDistrict,
        canFarmVisit,
        atCapacity,
        alreadyAssigned: alreadyAssignedIds.has(t.id),
      };
    })
  );

  candidates.sort((a, b) => {
    // Best matches first: expertise match, then same district, then most headroom.
    if (a.matchesExpertise !== b.matchesExpertise) return a.matchesExpertise ? -1 : 1;
    if (a.sameDistrict !== b.sameDistrict) return a.sameDistrict ? -1 : 1;
    return a.activeCases - b.activeCases;
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Find a Trainer</h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.title} &middot; {c.district}, {c.sector}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {candidates.map((cand) => (
            <li key={cand.trainer.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {cand.trainer.fullName}
                  {cand.matchesExpertise && (
                    <span className="ml-2 rounded-full bg-tone-success-bg px-2 py-0.5 text-xs font-semibold text-tone-success-text">
                      Match
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  Expertise: {cand.expertise.map((e) => enumLabel(EXPERTISE_LABELS, e)).join(", ") || "—"}
                </p>
                <p className="text-xs text-slate-500">
                  {cand.trainer.district}, {cand.trainer.sector}
                  {cand.sameDistrict && " (same district)"}
                  {c.farmVisitRequired && (cand.canFarmVisit ? " · Can do Farm Visit" : " · Cannot do Farm Visit")}
                </p>
                <p className="text-xs text-slate-500">
                  Active Cases: {cand.activeCases} / {cand.trainer.maxActiveCases}
                  {cand.trainer.availability !== "AVAILABLE" && " · Temporarily Unavailable"}
                </p>
              </div>

              {cand.alreadyAssigned ? (
                <span className="text-xs text-slate-400">Already assigned</span>
              ) : (
                <form action={assignTrainerToCase.bind(null, c.id, cand.trainer.id)}>
                  <button
                    type="submit"
                    disabled={cand.atCapacity || cand.trainer.availability !== "AVAILABLE"}
                    className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                    title={
                      cand.atCapacity
                        ? "At maximum active Cases"
                        : cand.trainer.availability !== "AVAILABLE"
                        ? "Trainer is temporarily unavailable"
                        : undefined
                    }
                  >
                    Select
                  </button>
                </form>
              )}
            </li>
          ))}
          {candidates.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-500">No Verified Trainers yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
