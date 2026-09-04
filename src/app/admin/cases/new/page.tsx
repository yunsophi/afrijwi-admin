import { prisma } from "@/lib/prisma";
import { NewCaseForm } from "./NewCaseForm";

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: Promise<{ farmerId?: string }>;
}) {
  const { farmerId } = await searchParams;
  const farmers = await prisma.farmer.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">New Case</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a Case from your WhatsApp conversation with a Farmer.
        </p>
      </div>
      <NewCaseForm farmers={farmers} defaultFarmerId={farmerId} />
    </div>
  );
}
