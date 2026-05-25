import { Navbar } from '@/components/layout/navbar';
import { MemberSwitcher } from '@/features/members/components/member-switcher';
import { requireSession } from '@/server/auth/session';
import { listMembers, getCurrentMember } from '@/features/members/server/queries';
import { FooterConditional } from './footer-conditional';

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
      <main className="flex flex-1 flex-col">{children}</main>
      <FooterConditional />
    </>
  );
}
