import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { MemberSwitcher } from '@/features/members/components/member-switcher';
import { requireSession } from '@/server/auth/session';
import { listMembers, getCurrentMember } from '@/features/members/server/queries';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const [members, current] = await Promise.all([
    listMembers(session.user.id),
    getCurrentMember(session.user.id),
  ]);

  return (
    <>
      <Navbar />
      <div className="border-b bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <MemberSwitcher members={members} currentMemberId={current?.id ?? null} />
        </div>
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
