'use client';

import { useState, useTransition } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, UserCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { quickProfileSchema } from '@/features/members/lib/profile-schema';
import { saveMyQuickProfile, type CurrentMemberProfile } from '@/features/members/server/profile';
import { SEX_LABELS } from '@/features/members/lib/schema';

interface Props {
  profile: CurrentMemberProfile;
}

type FieldErrors = Partial<Record<'age' | 'sex' | 'form', string>>;

export function QuickProfileGate({ profile }: Props) {
  const [pending, startTransition] = useTransition();
  const [age, setAge] = useState<string>(profile.age != null ? String(profile.age) : '');
  const [sex, setSex] = useState<'male' | 'female' | 'other' | ''>(profile.sex ?? '');
  const [conditions, setConditions] = useState(profile.existingConditions.join(', '));
  const [medications, setMedications] = useState(profile.medications.join(', '));
  const [allergies, setAllergies] = useState(profile.allergies.join(', '));
  const [showOptional, setShowOptional] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Profile already complete — collapsed status card with edit option.
  if (profile.isComplete && !pending && Object.keys(errors).length === 0) {
    return <ProfileSummary profile={profile} />;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = quickProfileSchema.safeParse({
      age,
      sex,
      existingConditions: conditions,
      medications,
      allergies,
    });

    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (key === 'age' || key === 'sex') next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    startTransition(async () => {
      try {
        await saveMyQuickProfile(result.data);
      } catch (err) {
        setErrors({ form: err instanceof Error ? err.message : 'Failed to save profile' });
      }
    });
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <UserCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">A few details before we analyze</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Age and sex meaningfully change the recommendation. We&apos;ll save these to your
              profile and won&apos;t ask again.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="qp-age" className="text-xs font-medium">
                Age <span className="text-red-500">*</span>
              </Label>
              <Input
                id="qp-age"
                type="number"
                inputMode="numeric"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 32"
                aria-invalid={!!errors.age}
                aria-describedby={errors.age ? 'qp-age-err' : undefined}
              />
              {errors.age && (
                <p id="qp-age-err" className="text-xs text-red-600 dark:text-red-400">
                  {errors.age}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Sex <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-1.5">
                {(Object.entries(SEX_LABELS) as [keyof typeof SEX_LABELS, string][]).map(
                  ([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSex(value)}
                      className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                        sex === value
                          ? 'border-teal-500 bg-teal-50 font-medium text-teal-900 dark:border-teal-600 dark:bg-teal-950/40 dark:text-teal-100'
                          : 'border-input bg-background hover:bg-accent'
                      }`}
                      aria-pressed={sex === value}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
              {errors.sex && <p className="text-xs text-red-600 dark:text-red-400">{errors.sex}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOptional((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {showOptional ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showOptional ? 'Hide' : 'Add'} medical history (optional)
          </button>

          {showOptional && (
            <div className="space-y-3 border-l-2 border-amber-200 pl-3 dark:border-amber-900/50">
              <OptionalField
                id="qp-conditions"
                label="Existing conditions"
                value={conditions}
                onChange={setConditions}
                placeholder="e.g. diabetes, asthma"
                hint="Comma-separated"
              />
              <OptionalField
                id="qp-meds"
                label="Current medications"
                value={medications}
                onChange={setMedications}
                placeholder="e.g. metformin, salbutamol"
                hint="Comma-separated"
              />
              <OptionalField
                id="qp-allergies"
                label="Known allergies"
                value={allergies}
                onChange={setAllergies}
                placeholder="e.g. penicillin, peanuts"
                hint="Comma-separated"
              />
            </div>
          )}

          {errors.form && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              <AlertTriangle className="h-3.5 w-3.5 flex-none" />
              <span>{errors.form}</span>
            </div>
          )}

          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? 'Saving…' : 'Save and continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function OptionalField(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hint: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={props.id} className="text-xs font-medium">
        {props.label}
      </Label>
      <Input
        id={props.id}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
      />
      <p className="text-[10px] text-muted-foreground">{props.hint}</p>
    </div>
  );
}

function ProfileSummary({ profile }: { profile: CurrentMemberProfile }) {
  const chips: string[] = [];
  if (profile.age != null) chips.push(`${profile.age} yrs`);
  if (profile.sex) chips.push(SEX_LABELS[profile.sex]);
  if (profile.existingConditions.length > 0)
    chips.push(`${profile.existingConditions.length} condition(s)`);
  if (profile.medications.length > 0) chips.push(`${profile.medications.length} med(s)`);
  if (profile.allergies.length > 0) chips.push(`${profile.allergies.length} allergy(ies)`);

  return (
    <Card className="mb-6 border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <CheckCircle2 className="h-5 w-5 flex-none text-emerald-600 dark:text-emerald-400" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Profile complete &middot; {profile.name}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {chips.map((c) => (
                <Badge key={c} variant="outline" className="text-[10px]">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
