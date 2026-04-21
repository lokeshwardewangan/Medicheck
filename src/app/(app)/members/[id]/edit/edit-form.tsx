'use client';

import { MemberForm } from '@/features/members/components/member-form';
import { updateMember } from '@/features/members/server/actions';
import type { MemberFormInput } from '@/features/members/lib/schema';

export function EditMemberForm({
  memberId,
  defaultValues,
}: {
  memberId: string;
  defaultValues: Partial<MemberFormInput>;
}) {
  return (
    <MemberForm
      submitLabel="Save changes"
      defaultValues={defaultValues}
      cancelHref="/members"
      onSubmit={(values) => updateMember(memberId, values)}
    />
  );
}
