import Link from 'next/link';
import { Mail } from 'lucide-react';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-secondary p-4">
          <Mail className="size-8" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          {email ? (
            <>
              We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>
              . Click it to continue.
            </>
          ) : (
            'We sent you a sign-in link. Click it to continue.'
          )}
        </p>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Didn&apos;t get the email? Check spam, or wait a minute and try again.</p>
        <p>
          <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
            Use a different email
          </Link>
        </p>
      </div>
    </div>
  );
}
