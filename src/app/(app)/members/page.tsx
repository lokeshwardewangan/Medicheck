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
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Family members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track health for yourself and the people you care for.
          </p>
        </div>
        <Link href="/members/new">
          <Button>
            <Plus className="size-4 mr-1" /> Add member
          </Button>
        </Link>
      </div>

      <MembersList members={members} />
    </div>
  );
}
