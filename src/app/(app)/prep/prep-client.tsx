'use client';

import { useState, useTransition } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrepSheetPreview } from '@/features/prep-sheet/components/prep-sheet-preview';
import { generatePrepSheetForCurrentMember } from '@/features/prep-sheet/server/actions';
import type { PrepSheet } from '@/features/prep-sheet/lib/schema';

interface State {
  prepSheet: PrepSheet;
  memberName: string;
  generatedAt: Date;
}

export function PrepClient({ hasMember }: { hasMember: boolean }) {
  const [pending, startTransition] = useTransition();
  const [downloading, setDownloading] = useState(false);
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState<string | null>(null);

  function generate() {
    setError(null);
    startTransition(async () => {
      try {
        const { prepSheet, memberName } = await generatePrepSheetForCurrentMember();
        setState({ prepSheet, memberName, generatedAt: new Date() });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not generate prep sheet');
      }
    });
  }

  async function downloadPdf() {
    if (!state) return;
    setDownloading(true);
    setError(null);
    try {
      // Dynamic import keeps @react-pdf/renderer out of the initial bundle.
      const { pdf } = await import('@react-pdf/renderer');
      const { PrepSheetDocument } = await import(
        '@/features/prep-sheet/components/prep-sheet-pdf'
      );

      const blob = await pdf(
        <PrepSheetDocument
          memberName={state.memberName}
          prepSheet={state.prepSheet}
          generatedAt={state.generatedAt}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `healthmate-prep-${state.memberName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[prep-pdf] download failed', err);
      setError('Could not generate the PDF. Try again.');
    } finally {
      setDownloading(false);
    }
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
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={generate} disabled={pending}>
          <Sparkles className="size-4 mr-2" />
          {pending ? 'Generating...' : state ? 'Regenerate' : 'Generate prep sheet'}
        </Button>
        {state && (
          <Button onClick={downloadPdf} disabled={downloading} variant="outline">
            <Download className="size-4 mr-2" />
            {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </Button>
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
