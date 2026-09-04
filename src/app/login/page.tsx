import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            AFRIJWI
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">
            Trainer Matching — Sign in
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            For AFRIJWI Admin and Verified Trainers.
          </p>
        </div>

        <LoginForm callbackUrl={callbackUrl || "/"} />
      </div>
    </div>
  );
}
