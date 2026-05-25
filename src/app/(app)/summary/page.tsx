import { redirect } from 'next/navigation';
import { QuickProfileGate } from '@/features/members/components/quick-profile-gate';
import { getMyCurrentProfile } from '@/features/members/server/profile';
import { SummaryShell } from './summary-shell';

export default async function SummaryPage() {
  const profile = await getMyCurrentProfile();
  if (!profile) {
    // No primary member — bootstrap should have created one. If not, send
    // them through the members onboarding rather than crashing the page.
    redirect('/members');
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 pt-6">
      <QuickProfileGate profile={profile} />
      <SummaryShell profileComplete={profile.isComplete} />
    </div>
  );
}
