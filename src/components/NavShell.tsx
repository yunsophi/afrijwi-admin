import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export type NavItem = { href: string; label: string };

export function NavShell({
  title,
  subtitle,
  navItems,
  userLabel,
  children,
}: {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  userLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Sidebar — collapses to a horizontal scroll strip on mobile so Trainers
          on a phone still get every nav item without a hamburger menu. */}
      <aside className="border-b border-slate-200 bg-white md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="px-4 py-4 md:px-5 md:py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {title}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible md:px-3 md:pb-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 md:whitespace-normal"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8">
          <p className="text-sm text-slate-500">{userLabel}</p>
          <SignOutButton />
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
