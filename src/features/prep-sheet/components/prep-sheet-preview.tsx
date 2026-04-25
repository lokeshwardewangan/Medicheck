import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PrepSheet } from '@/features/prep-sheet/lib/schema';

interface Props {
  memberName: string;
  prepSheet: PrepSheet;
}

export function PrepSheetPreview({ memberName, prepSheet }: Props) {
  return (
    <article className="space-y-6 print:space-y-4">
      <header className="space-y-1 border-b pb-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Doctor visit prep</p>
        <h2 className="text-2xl font-bold">{memberName}</h2>
        <p className="text-sm text-muted-foreground">
          Generated {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </header>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Chief complaint
        </h3>
        <p className="text-lg font-medium leading-relaxed">{prepSheet.chiefComplaint}</p>
      </section>

      {prepSheet.timeline.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Timeline
          </h3>
          <ol className="space-y-2 border-l-2 border-muted pl-4">
            {prepSheet.timeline.map((entry, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[1.4rem] top-1.5 size-3 rounded-full bg-primary" />
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{entry.when}</span>
                  {entry.severity != null && (
                    <Badge variant="secondary" className="text-xs">
                      severity {entry.severity}/10
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{entry.description}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
              Current medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prepSheet.currentMedications.length > 0 ? (
              <ul className="text-sm space-y-1">
                {prepSheet.currentMedications.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">None</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
              Active conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prepSheet.activeConditions.length > 0 ? (
              <ul className="text-sm space-y-1">
                {prepSheet.activeConditions.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">None</p>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prepSheet.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {prepSheet.allergies.map((a, i) => (
                  <Badge key={i} variant="destructive">
                    {a}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">None reported</p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-2 border-t pt-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Questions to ask the doctor
        </h3>
        <ol className="space-y-2 list-decimal list-inside">
          {prepSheet.questionsForDoctor.map((q, i) => (
            <li key={i} className="text-base leading-relaxed">
              {q}
            </li>
          ))}
        </ol>
      </section>

      {prepSheet.notes && (
        <section className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Notes
          </h3>
          <p className="text-sm">{prepSheet.notes}</p>
        </section>
      )}
    </article>
  );
}
