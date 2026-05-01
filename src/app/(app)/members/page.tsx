import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MembersList } from '@/features/members/components/members-list';
import { listMembers } from '@/features/members/server/queries';
import { requireSession } from '@/server/auth/session';

export default async function MembersPage() {
  const session = await requireSession();
  const members = await listMembers(session.user.id);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Family members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track health for yourself and the people you care for.
          </p>
        </div>
        <Link href="/members/new">
          <Button>
            <Plus className="mr-1 size-4" /> Add member
          </Button>
        </Link>
      </div>

      <MembersList members={members} />
    </div>
  );
}
