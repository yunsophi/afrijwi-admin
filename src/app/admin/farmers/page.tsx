import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function FarmersPage() {
  const farmers = await prisma.farmer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cases: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Farmers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registered from AFRIJWI&rsquo;s WhatsApp conversations with Farmers.
          </p>
        </div>
        <Link
          href="/admin/farmers/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Add Farmer
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {farmers.map((f) => (
            <li key={f.id}>
              <Link
                href={`/admin/farmers/${f.id}`}
                className="flex flex-col gap-1 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{f.name}</p>
                  <p className="text-xs text-slate-500">
                    {f.phone} &middot; {f.district}, {f.sector}
                  </p>
                </div>
                <span className="text-xs text-slate-500">{f._count.cases} Case(s)</span>
              </Link>
            </li>
          ))}
          {farmers.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-500">No Farmers registered yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
