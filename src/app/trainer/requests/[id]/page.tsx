import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentTrainer } from "@/lib/current-trainer";
import { acceptRequest } from "@/lib/actions/trainer";
import { CASE_CATEGORY_LABELS, enumLabel, parseJsonArray, EXPERTISE_LABELS } from "@/lib/constants";
import { DeclineForm } from "./DeclineForm";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trainer = await requireCurrentTrainer();

  const assignment = await prisma.trainerAssignment.findUnique({
    where: { id },
    include: { case: true },
  });

  // Ownership check — a Trainer can only view a Request that was actually
  // sent to them, and only while it is still awaiting a response.
  if (!assignment || assignment.trainerId !== trainer.id) {
    notFound();
  }

  const { case: c } = assignment;
  const requiredExpertise = parseJsonArray(c.requiredExpertise);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {enumLabel(CASE_CATEGORY_LABELS, c.category)} &middot; Case #{c.id.slice(-6).toUpperCase()}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <Field label="Farmer Location" value={`${c.district}, ${c.sector}`} />
        <Field label="Problem" value={c.description} />
        <Field label="Urgency" value={c.urgency} />
        <Field
          label="Required Expertise"
          value={requiredExpertise.map((e) => enumLabel(EXPERTISE_LABELS, e)).join(", ") || "—"}
        />
        <Field label="Farm Visit" value={c.farmVisitRequired ? "May be required" : "Not indicated"} />
      </div>

      {assignment.status === "SENT" ? (
        <div className="flex flex-wrap gap-3">
          <form action={acceptRequest.bind(null, assignment.id)}>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Accept Request
            </button>
          </form>
          <DeclineForm assignmentId={assignment.id} />
        </div>
      ) : (
        <p className="rounded-xl bg-tone-neutral-bg px-4 py-3 text-sm text-tone-neutral-text">
          You already responded to this Request ({assignment.status.toLowerCase()}).
        </p>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-800">{value}</p>
    </div>
  );
}
