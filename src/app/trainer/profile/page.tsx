import { requireCurrentTrainer } from "@/lib/current-trainer";
import { parseJsonArray } from "@/lib/constants";
import { ProfileForm } from "./ProfileForm";

export default async function TrainerProfilePage() {
  const trainer = await requireCurrentTrainer();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Keep this up to date so AFRIJWI can match you to the right Requests.
        </p>
      </div>

      <ProfileForm
        trainer={trainer}
        expertise={parseJsonArray(trainer.expertise)}
        supportMethods={parseJsonArray(trainer.supportMethods)}
      />
    </div>
  );
}
