import 'server-only';
import { cookies } from 'next/headers';
import { eq, desc } from 'drizzle-orm';
import { member, household, type Member } from '@/db/schema/household';
import { withUserContext } from '@/server/db/with-user-context';

const CURRENT_MEMBER_COOKIE = 'current_member_id';

export async function listMembers(userId: string): Promise<Member[]> {
  return withUserContext(userId, async (tx) => {
    return tx.select().from(member).orderBy(desc(member.isPrimary), member.createdAt);
  });
}

export async function getMemberById(userId: string, memberId: string): Promise<Member | null> {
  return withUserContext(userId, async (tx) => {
    const rows = await tx.select().from(member).where(eq(member.id, memberId)).limit(1);
    return rows[0] ?? null;
  });
}

export async function getCurrentMember(userId: string): Promise<Member | null> {
  const cookieStore = await cookies();
  const cookieMemberId = cookieStore.get(CURRENT_MEMBER_COOKIE)?.value;

  return withUserContext(userId, async (tx) => {
    if (cookieMemberId) {
      const rows = await tx
        .select()
        .from(member)
        .where(eq(member.id, cookieMemberId))
        .limit(1);
      if (rows[0]) return rows[0];
    }

    const rows = await tx
      .select()
      .from(member)
      .where(eq(member.isPrimary, true))
      .limit(1);
    return rows[0] ?? null;
  });
}

export async function getOwnedHouseholdId(userId: string): Promise<string | null> {
  return withUserContext(userId, async (tx) => {
    const rows = await tx
      .select({ id: household.id })
      .from(household)
      .where(eq(household.ownerId, userId))
      .limit(1);
    return rows[0]?.id ?? null;
  });
}

export { CURRENT_MEMBER_COOKIE };
