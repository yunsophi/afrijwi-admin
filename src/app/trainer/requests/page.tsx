import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentTrainer } from "@/lib/current-trainer";
import { CASE_CATEGORY_LABELS, enumLabel } from "@/lib/constants";

export default async function TrainerRequestsPage() {
  const trainer = await requireCurrentTrainer();

  const requests = await prisma.trainerAssignment.findMany({
    where: { trainerId: trainer.id, status: "SENT" },
    include: { case: true },
    orderBy: { assignedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">New Requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Requests AFRIJWI has sent you. Accept only what you can take on.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/trainer/requests/${r.id}`}
                className="flex flex-col gap-1 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{r.case.title}</p>
                  <p className="text-xs text-slate-500">
                    {enumLabel(CASE_CATEGORY_LABELS, r.case.category)} &middot; {r.case.district}, {r.case.sector}
                    {r.case.farmVisitRequired && " · Farm Visit"}
                  </p>
                </div>
                <span className="text-sm font-medium text-brand-600">Review →</span>
              </Link>
            </li>
          ))}
          {requests.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-500">
              No new Requests right now.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
