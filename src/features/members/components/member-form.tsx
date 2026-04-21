'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  memberFormSchema,
  type MemberFormInput,
  RELATION_LABELS,
  SEX_LABELS,
} from '@/features/members/lib/schema';

interface Props {
  defaultValues?: Partial<MemberFormInput>;
  submitLabel: string;
  onSubmit: (values: MemberFormInput) => Promise<void>;
  cancelHref?: string;
}

const SELECT_STYLES =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export function MemberForm({ defaultValues, submitLabel, onSubmit, cancelHref }: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormInput>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: '',
      relation: 'self',
      age: null,
      sex: null,
      ...defaultValues,
    },
  });

  const submit = handleSubmit((values) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        await onSubmit(values);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Something went wrong');
      }
    });
  });

  const busy = isSubmitting || pending;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="e.g. Priya" {...register('name')} disabled={busy} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="relation">Relation</Label>
        <select id="relation" className={SELECT_STYLES} {...register('relation')} disabled={busy}>
          {Object.entries(RELATION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.relation && <p className="text-sm text-destructive">{errors.relation.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={120}
            placeholder="—"
            {...register('age')}
            disabled={busy}
          />
          {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <select id="sex" className={SELECT_STYLES} {...register('sex')} disabled={busy}>
            <option value="">—</option>
            {Object.entries(SEX_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.sex && <p className="text-sm text-destructive">{errors.sex.message}</p>}
        </div>
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving...' : submitLabel}
        </Button>
        {cancelHref && (
          <Button type="button" variant="ghost" disabled={busy} onClick={() => router.push(cancelHref)}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
