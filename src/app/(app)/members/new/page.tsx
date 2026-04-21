'use client';

import { MemberForm } from '@/features/members/components/member-form';
import { createMember } from '@/features/members/server/actions';

export default function NewMemberPage() {
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add member</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add yourself or someone whose health you help manage.
        </p>
      </div>

      <MemberForm submitLabel="Add member" onSubmit={createMember} cancelHref="/members" />
    </div>
  );
}
