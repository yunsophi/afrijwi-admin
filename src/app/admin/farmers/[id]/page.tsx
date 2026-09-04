import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { EditFarmerForm } from "./EditFarmerForm";

export default async function FarmerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const farmer = await prisma.farmer.findUnique({
    where: { id },
    include: { cases: { orderBy: { createdAt: "desc" } } },
  });

  if (!farmer) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{farmer.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {farmer.district}, {farmer.sector}
          </p>
        </div>
        <Link
          href={`/admin/cases/new?farmerId=${farmer.id}`}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + New Case
        </Link>
      </div>

      <EditFarmerForm farmer={farmer} />

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Cases</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {farmer.cases.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/cases/${c.id}`}
                className="flex flex-col gap-1 px-5 py-3 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm font-medium text-slate-900">{c.title}</p>
                <StatusBadge status={c.status} />
              </Link>
            </li>
          ))}
          {farmer.cases.length === 0 && (
            <li className="px-5 py-6 text-sm text-slate-500">No Cases yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
