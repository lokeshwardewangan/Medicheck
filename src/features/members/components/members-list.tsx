'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { deleteMember } from '@/features/members/server/actions';
import { RELATION_LABELS } from '@/features/members/lib/schema';
import type { Member } from '@/db/schema/household';

export function MembersList({ members }: { members: Member[] }) {
  const [pending, startTransition] = useTransition();

  function remove(id: string, name: string) {
    if (!confirm(`Remove ${name}? This deletes their health records too.`)) return;
    startTransition(() => deleteMember(id));
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No members yet. Add yourself or a family member to start tracking.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((m) => (
        <Card key={m.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{m.name}</span>
                {m.isPrimary && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                    <Star className="size-3 fill-current" /> Primary
                  </span>
                )}
              </div>
              <div className="space-x-2 text-xs text-muted-foreground">
                <span>{RELATION_LABELS[m.relation]}</span>
                {m.age !== null && <span>· Age {m.age}</span>}
                {m.sex && <span>· {m.sex}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/members/${m.id}/edit`}>
                <Button size="sm" variant="ghost">
                  <Pencil className="size-4" />
                </Button>
              </Link>
              {!m.isPrimary && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => remove(m.id, m.name)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
