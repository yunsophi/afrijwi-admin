import { auth } from "@/lib/auth";
import { NavShell } from "@/components/NavShell";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/farmers", label: "Farmers" },
  { href: "/admin/cases", label: "Requests / Cases" },
  { href: "/admin/trainers", label: "Trainers" },
  { href: "/admin/farm-visits", label: "Farm Visits" },
  { href: "/admin/feedback", label: "Feedback" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();

  return (
    <NavShell
      title="AFRIJWI Admin"
      subtitle="Farmer Support & Trainer Matching"
      navItems={ADMIN_NAV}
      userLabel={session?.user?.email ?? ""}
    >
      {children}
    </NavShell>
  );
}
