import { notFound } from 'next/navigation';
import { requireSession } from '@/server/auth/session';
import { getMemberById } from '@/features/members/server/queries';
import { EditMemberForm } from './edit-form';

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();
  const member = await getMemberById(session.user.id, id);
  if (!member) notFound();

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit member</h1>
        <p className="mt-1 text-sm text-muted-foreground">{member.name}</p>
      </div>

      <EditMemberForm
        memberId={member.id}
        defaultValues={{
          name: member.name,
          relation: member.relation,
          age: member.age,
          sex: member.sex,
        }}
      />
    </div>
  );
}
