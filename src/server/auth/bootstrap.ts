import 'server-only';
import { eq } from 'drizzle-orm';
import { household, member } from '@/db/schema/household';
import { withUserContext } from '@/server/db/with-user-context';

/**
 * Provisions a freshly-signed-up user's tenancy: one household + a primary
 * "Self" member. Idempotent — safe to call repeatedly for the same user id.
 */
export async function bootstrapUser(
  userId: string,
  email: string,
  name?: string | null
): Promise<{ householdId: string; memberId: string }> {
  const displayName = (name?.trim() || email.split('@')[0]) ?? 'Self';

  return withUserContext(userId, async (tx) => {
    const existingHousehold = await tx
      .select({ id: household.id })
      .from(household)
      .where(eq(household.ownerId, userId))
      .limit(1);

    if (existingHousehold.length > 0) {
      const householdId = existingHousehold[0].id;
      const existingPrimary = await tx
        .select({ id: member.id })
        .from(member)
        .where(eq(member.householdId, householdId))
        .limit(1);
      return {
        householdId,
        memberId: existingPrimary[0]?.id ?? '',
      };
    }

    const [createdHousehold] = await tx
      .insert(household)
      .values({ ownerId: userId, name: 'My household' })
      .returning({ id: household.id });

    const [createdMember] = await tx
      .insert(member)
      .values({
        householdId: createdHousehold.id,
        name: displayName,
        relation: 'self',
        isPrimary: true,
      })
      .returning({ id: member.id });

    return { householdId: createdHousehold.id, memberId: createdMember.id };
  });
}
