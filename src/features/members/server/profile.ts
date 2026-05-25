'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/server/auth/session';
import { withUserContext } from '@/server/db/with-user-context';
import { member, memberProfile } from '@/db/schema/household';
import { recordPhiAccess } from '@/server/audit/phi-logger';
import { getCurrentMember } from './queries';
import { quickProfileSchema, type QuickProfileInput } from '../lib/profile-schema';

export type CurrentMemberProfile = {
  memberId: string;
  name: string;
  relation: string;
  age: number | null;
  sex: 'male' | 'female' | 'other' | null;
  existingConditions: string[];
  medications: string[];
  allergies: string[];
  isComplete: boolean;
};

export async function getMyCurrentProfile(): Promise<CurrentMemberProfile | null> {
  const session = await requireSession();
  const current = await getCurrentMember(session.user.id);
  if (!current) return null;

  return withUserContext(session.user.id, async (tx) => {
    const rows = await tx
      .select()
      .from(memberProfile)
      .where(eq(memberProfile.memberId, current.id))
      .limit(1);
    const p = rows[0];

    return {
      memberId: current.id,
      name: current.name,
      relation: current.relation,
      age: current.age ?? null,
      sex: current.sex ?? null,
      existingConditions: p?.existingConditions ?? [],
      medications: p?.medications ?? [],
      allergies: p?.allergies ?? [],
      isComplete: current.age != null && current.sex != null,
    };
  });
}

export async function saveMyQuickProfile(input: QuickProfileInput): Promise<void> {
  const session = await requireSession();
  const parsed = quickProfileSchema.parse(input);

  const current = await getCurrentMember(session.user.id);
  if (!current) throw new Error('No current member');

  await withUserContext(session.user.id, async (tx) => {
    await tx
      .update(member)
      .set({ age: parsed.age, sex: parsed.sex, updatedAt: new Date() })
      .where(eq(member.id, current.id));

    // Upsert the profile row (member_profile.memberId is UNIQUE).
    const existing = await tx
      .select({ id: memberProfile.id })
      .from(memberProfile)
      .where(eq(memberProfile.memberId, current.id))
      .limit(1);

    if (existing[0]) {
      await tx
        .update(memberProfile)
        .set({
          existingConditions: parsed.existingConditions,
          medications: parsed.medications,
          allergies: parsed.allergies,
          updatedAt: new Date(),
        })
        .where(eq(memberProfile.id, existing[0].id));
    } else {
      await tx.insert(memberProfile).values({
        memberId: current.id,
        existingConditions: parsed.existingConditions,
        medications: parsed.medications,
        allergies: parsed.allergies,
      });
    }
  });

  await recordPhiAccess({
    userId: session.user.id,
    action: 'update',
    resourceType: 'member_profile',
    resourceId: current.id,
  });

  revalidatePath('/summary');
}
