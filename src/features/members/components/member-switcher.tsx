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
            <Plus className="size-4 mr-1" /> Add member
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">Logging for</span>

      <div className="relative">
        <details className="group">
          <summary className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card hover:bg-accent cursor-pointer text-sm font-medium list-none [&::-webkit-details-marker]:hidden">
            <span>{current?.name ?? 'Select member'}</span>
            {current && (
              <span className="text-xs text-muted-foreground">
                · {RELATION_LABELS[current.relation]}
              </span>
            )}
            <ChevronDown className="size-4 ml-1" />
          </summary>

          <div className="absolute z-10 mt-1 w-64 rounded-md border bg-popover shadow-md py-1">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => pick(m.id)}
                disabled={pending}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent text-left ${
                  m.id === current?.id ? 'bg-accent/50' : ''
                }`}
              >
                <span className="font-medium">{m.name}</span>
                <span className="text-xs text-muted-foreground">{RELATION_LABELS[m.relation]}</span>
              </button>
            ))}
            <div className="border-t mt-1 pt-1">
              <Link
                href="/members"
                className="flex items-center px-3 py-2 text-sm hover:bg-accent text-muted-foreground"
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
