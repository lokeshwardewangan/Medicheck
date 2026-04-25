'use client';

import { useState, useTransition } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrepSheetPreview } from '@/features/prep-sheet/components/prep-sheet-preview';
import { generatePrepSheetForCurrentMember } from '@/features/prep-sheet/server/actions';
import type { PrepSheet } from '@/features/prep-sheet/lib/schema';

interface State {
  prepSheet: PrepSheet;
  memberName: string;
}

export function PrepClient({ hasMember }: { hasMember: boolean }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState<string | null>(null);

  function generate() {
    setError(null);
    startTransition(async () => {
      try {
        const { prepSheet, memberName } = await generatePrepSheetForCurrentMember();
        setState({ prepSheet, memberName });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not generate prep sheet');
      }
    });
  }

  if (!hasMember) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a member first to generate a prep sheet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button onClick={generate} disabled={pending}>
          <Sparkles className="size-4 mr-2" />
          {pending ? 'Generating...' : state ? 'Regenerate' : 'Generate prep sheet'}
        </Button>
        {state && (
          <span className="text-xs text-muted-foreground">
            Tip: open the browser print dialog (Ctrl/Cmd + P) for a printable view. PDF download lands in T15.
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {state && (
        <div className="rounded-lg border bg-card p-6">
          <PrepSheetPreview memberName={state.memberName} prepSheet={state.prepSheet} />
        </div>
      )}
    </div>
  );
}
