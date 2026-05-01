import { requireSession } from '@/server/auth/session';
import { getCurrentMember } from '@/features/members/server/queries';
import { PrepClient } from './prep-client';

export default async function PrepPage() {
  const session = await requireSession();
  const current = await getCurrentMember(session.user.id);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Doctor visit prep</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a one-page summary you can read out at the start of your appointment. Uses{' '}
          {current?.name ?? 'the current member'}&apos;s logged symptoms and profile.
        </p>
      </div>

      <PrepClient hasMember={!!current} />
    </div>
  );
}
