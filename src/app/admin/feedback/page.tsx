import Link from "next/link";
import { prisma } from "@/lib/prisma";

const ADDRESSED_LABELS: Record<string, string> = {
  YES: "Yes",
  PARTIALLY: "Partially",
  NO: "No",
};

const ADDRESSED_TONE: Record<string, string> = {
  YES: "bg-tone-success-bg text-tone-success-text",
  PARTIALLY: "bg-tone-warning-bg text-tone-warning-text",
  NO: "bg-tone-danger-bg text-tone-danger-text",
};

export default async function FeedbackPage() {
  const feedbacks = await prisma.feedback.findMany({
    include: { case: true, trainer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Feedback</h1>
        <p className="mt-1 text-sm text-slate-500">
          Farmer Feedback recorded by AFRIJWI when a Case is completed.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {feedbacks.map((f) => (
            <li key={f.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/admin/cases/${f.case.id}`} className="text-sm font-medium text-slate-900 hover:underline">
                  {f.case.title}
                </Link>
                <p className="text-xs text-slate-500">
                  <Link href={`/admin/trainers/${f.trainer.id}`} className="hover:underline">
                    {f.trainer.fullName}
                  </Link>
                  {f.rating ? ` · ${"★".repeat(f.rating)} (${f.rating}/5)` : ""}
                </p>
                {f.comment && <p className="mt-1 text-xs text-slate-600">{f.comment}</p>}
              </div>
              <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${ADDRESSED_TONE[f.addressed]}`}>
                {ADDRESSED_LABELS[f.addressed]}
              </span>
            </li>
          ))}
          {feedbacks.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-500">
              No Feedback yet — it&rsquo;s recorded when a Case is completed.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
