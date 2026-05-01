'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { switchMember } from '@/features/members/server/actions';
import { RELATION_LABELS } from '@/features/members/lib/schema';
import type { Member } from '@/db/schema/household';

interface Props {
  members: Member[];
  currentMemberId: string | null;
}

export function MemberSwitcher({ members, currentMemberId }: Props) {
  const [pending, startTransition] = useTransition();
  const current = members.find((m) => m.id === currentMemberId) ?? members[0] ?? null;

  function pick(memberId: string) {
    if (memberId === current?.id) return;
    startTransition(() => switchMember(memberId));
  }

  if (members.length === 0) {
    return (
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">No members yet</span>
        <Link href="/members/new">
          <Button size="sm">
            <Plus className="mr-1 size-4" /> Add member
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs tracking-wide text-muted-foreground uppercase">Logging for</span>

      <div className="relative">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent [&::-webkit-details-marker]:hidden">
            <span>{current?.name ?? 'Select member'}</span>
            {current && (
              <span className="text-xs text-muted-foreground">
                · {RELATION_LABELS[current.relation]}
              </span>
            )}
            <ChevronDown className="ml-1 size-4" />
          </summary>

          <div className="absolute z-10 mt-1 w-64 rounded-md border bg-popover py-1 shadow-md">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => pick(m.id)}
                disabled={pending}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent ${
                  m.id === current?.id ? 'bg-accent/50' : ''
                }`}
              >
                <span className="font-medium">{m.name}</span>
                <span className="text-xs text-muted-foreground">{RELATION_LABELS[m.relation]}</span>
              </button>
            ))}
            <div className="mt-1 border-t pt-1">
              <Link
                href="/members"
                className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
              >
                Manage members
              </Link>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
