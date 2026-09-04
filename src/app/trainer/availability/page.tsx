import { requireCurrentTrainer } from "@/lib/current-trainer";
import { AvailabilityForm } from "./AvailabilityForm";

export default async function AvailabilityPage() {
  const trainer = await requireCurrentTrainer();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Availability</h1>
        <p className="mt-1 text-sm text-slate-500">
          Control how many Requests AFRIJWI can send you at once.
        </p>
      </div>

      <AvailabilityForm
        availability={trainer.availability}
        maxActiveCases={trainer.maxActiveCases}
      />
    </div>
  );
}
