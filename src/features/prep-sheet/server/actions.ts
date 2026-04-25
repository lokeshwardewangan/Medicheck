'use server';

import { requireSession } from '@/server/auth/session';
import { getCurrentMember } from '@/features/members/server/queries';
import { generatePrepSheet as generatePrepSheetServer } from '@/server/prep-sheet/generate';
import { recordPhiAccess } from '@/server/audit/phi-logger';
import type { PrepSheet } from '@/features/prep-sheet/lib/schema';

export async function generatePrepSheetForCurrentMember(): Promise<{
  prepSheet: PrepSheet;
  memberId: string;
  memberName: string;
}> {
  const session = await requireSession();
  const current = await getCurrentMember(session.user.id);
  if (!current) throw new Error('No current member set');

  const { prepSheet, memberName } = await generatePrepSheetServer(session.user.id, current.id);

  await recordPhiAccess({
    userId: session.user.id,
    action: 'read',
    resourceType: 'prep_sheet',
    resourceId: current.id,
    metadata: { memberId: current.id },
  });

  return { prepSheet, memberId: current.id, memberName };
}
