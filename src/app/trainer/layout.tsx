import { auth } from "@/lib/auth";
import { NavShell } from "@/components/NavShell";

const TRAINER_NAV = [
  { href: "/trainer", label: "Dashboard" },
  { href: "/trainer/requests", label: "New Requests" },
  { href: "/trainer/cases", label: "Active Cases" },
  { href: "/trainer/cases/completed", label: "Completed Cases" },
  { href: "/trainer/profile", label: "My Profile" },
  { href: "/trainer/availability", label: "Availability" },
];

export default async function TrainerLayout({ children }: LayoutProps<"/trainer">) {
  const session = await auth();

  return (
    <NavShell
      title="AFRIJWI Trainer"
      subtitle="Farmer Support & Trainer Matching"
      navItems={TRAINER_NAV}
      userLabel={session?.user?.email ?? ""}
    >
      {children}
    </NavShell>
  );
}
