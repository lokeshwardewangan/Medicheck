'use client';

import { MemberForm } from '@/features/members/components/member-form';
import { createMember } from '@/features/members/server/actions';

export default function NewMemberPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add member</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add yourself or someone whose health you help manage.
        </p>
      </div>

      <MemberForm submitLabel="Add member" onSubmit={createMember} cancelHref="/members" />
    </div>
  );
}
