'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/server/auth/session';
import { withUserContext } from '@/server/db/with-user-context';
import { member } from '@/db/schema/household';
import { memberFormSchema, type MemberFormInput } from '@/features/members/lib/schema';
import { recordPhiAccess } from '@/server/audit/phi-logger';
import { CURRENT_MEMBER_COOKIE, getOwnedHouseholdId } from './queries';

export async function createMember(input: MemberFormInput) {
  const session = await requireSession();
  const parsed = memberFormSchema.parse(input);

  const householdId = await getOwnedHouseholdId(session.user.id);
  if (!householdId) throw new Error('No household for user');

  const newId = await withUserContext(session.user.id, async (tx) => {
    const [created] = await tx
      .insert(member)
      .values({
        householdId,
        name: parsed.name,
        relation: parsed.relation,
        age: parsed.age,
        sex: parsed.sex,
        isPrimary: false,
      })
      .returning({ id: member.id });
    return created.id;
  });

  await recordPhiAccess({
    userId: session.user.id,
    action: 'create',
    resourceType: 'member',
    resourceId: newId,
  });

  revalidatePath('/members');
  redirect('/members');
}

export async function updateMember(memberId: string, input: MemberFormInput) {
  const session = await requireSession();
  const parsed = memberFormSchema.parse(input);

  await withUserContext(session.user.id, async (tx) => {
    await tx
      .update(member)
      .set({
        name: parsed.name,
        relation: parsed.relation,
        age: parsed.age,
        sex: parsed.sex,
        updatedAt: new Date(),
      })
      .where(eq(member.id, memberId));
  });

  await recordPhiAccess({
    userId: session.user.id,
    action: 'update',
    resourceType: 'member',
    resourceId: memberId,
  });

  revalidatePath('/members');
  redirect('/members');
}

export async function deleteMember(memberId: string) {
  const session = await requireSession();

  await withUserContext(session.user.id, async (tx) => {
    const rows = await tx
      .select({ id: member.id, isPrimary: member.isPrimary })
      .from(member)
      .where(eq(member.id, memberId))
      .limit(1);
    if (!rows[0]) throw new Error('Member not found');
    if (rows[0].isPrimary) throw new Error('Cannot delete the primary member');
    await tx.delete(member).where(eq(member.id, memberId));
  });

  await recordPhiAccess({
    userId: session.user.id,
    action: 'delete',
    resourceType: 'member',
    resourceId: memberId,
  });

  revalidatePath('/members');
}

export async function switchMember(memberId: string) {
  const session = await requireSession();

  // Verify membership exists for this user (RLS enforces ownership).
  const exists = await withUserContext(session.user.id, async (tx) => {
    const rows = await tx
      .select({ id: member.id })
      .from(member)
      .where(eq(member.id, memberId))
      .limit(1);
    return rows.length > 0;
  });
  if (!exists) throw new Error('Member not found');

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_MEMBER_COOKIE, memberId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath('/');
}
