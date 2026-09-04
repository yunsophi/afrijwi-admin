import { NewFarmerForm } from "./NewFarmerForm";

export default function NewFarmerPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Add Farmer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Register a Farmer based on your WhatsApp conversation.
        </p>
      </div>
      <NewFarmerForm />
    </div>
  );
}
