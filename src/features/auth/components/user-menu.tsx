'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown, History, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from '@/features/auth/lib/auth-client';

function initialsOf(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return (first + last).toUpperCase() || (email?.[0]?.toUpperCase() ?? '?');
  }
  return email?.[0]?.toUpperCase() ?? '?';
}

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [signingOut, startSignOut] = useTransition();

  if (isPending) {
    return (
      <button
        type="button"
        disabled
        className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground"
        aria-label="Loading account"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </button>
    );
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
      >
        Sign in
      </Link>
    );
  }

  const user = session.user;
  const initials = initialsOf(user.name, user.email);

  function handleSignOut() {
    startSignOut(async () => {
      await signOut();
      router.push('/login');
      router.refresh();
    });
  }

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border bg-card py-1 pr-2 pl-1 transition-colors hover:bg-accent [&::-webkit-details-marker]:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-cyan-600 text-[10px] font-semibold text-white">
          {initials}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      {/* Popover */}
      <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border bg-popover shadow-lg">
        <div className="border-b bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-cyan-600 text-xs font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              {user.name && <p className="truncate text-sm font-medium">{user.name}</p>}
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="py-1">
          <MenuLink href="/members" icon={<Users className="h-4 w-4" />} label="Members" />
          <MenuLink href="/history" icon={<History className="h-4 w-4" />} label="History" />
          <MenuLink href="/profile" icon={<User className="h-4 w-4" />} label="My profile" />
        </nav>

        <div className="border-t py-1">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </details>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Link>
  );
}
