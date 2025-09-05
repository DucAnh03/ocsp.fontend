"use client";
import Link from 'next/link';
import { useAuth, UserRole } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isContractor = user?.role === UserRole.Contractor;
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-white border-r p-4">
        <nav className="space-y-2">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Tabs</div>
          <Link href="/projects?tab=projects" className="block px-3 py-2 rounded-md hover:bg-stone-100 text-stone-800">
            Projects
          </Link>
          {isContractor ? (
            <>
              <Link href="/projects?tab=invites" className="block px-3 py-2 rounded-md hover:bg-stone-100 text-stone-800">
                Invites & Proposals
              </Link>
              <Link href="/projects?tab=contracts" className="block px-3 py-2 rounded-md hover:bg-stone-100 text-stone-800">
                Contracts
              </Link>
            </>
          ) : (
            <>
              <Link href="/projects?tab=quotes" className="block px-3 py-2 rounded-md hover:bg-stone-100 text-stone-800">
                Quotes & Proposals
              </Link>
              <Link href="/projects?tab=contracts" className="block px-3 py-2 rounded-md hover:bg-stone-100 text-stone-800">
                Contracts
              </Link>
            </>
          )}
        </nav>
      </aside>
      <section className="p-6">{children}</section>
    </div>
  );
}
