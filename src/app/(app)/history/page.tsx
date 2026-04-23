import Link from 'next/link';
import { Calendar, Stethoscope, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requireSession } from '@/server/auth/session';
import { listHistory } from '@/features/assessment/server/queries';
import type { TriageLevel } from '@/types';

const triageColors: Record<TriageLevel, string> = {
  emergency: 'bg-red-100 text-red-800 border-red-300',
  urgent: 'bg-orange-100 text-orange-800 border-orange-300',
  routine: 'bg-blue-100 text-blue-800 border-blue-300',
  self_care: 'bg-green-100 text-green-800 border-green-300',
};

const triageLabels: Record<TriageLevel, string> = {
  emergency: 'Emergency',
  urgent: 'Urgent',
  routine: 'Routine',
  self_care: 'Self-Care',
};

function formatDateTime(date: Date) {
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function HistoryPage() {
  const session = await requireSession();
  const items = await listHistory(session.user.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Your health history</h1>
            <p className="text-muted-foreground">
              Past assessments across all members
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">← Back</Button>
          </Link>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No history yet</h3>
              <p className="text-muted-foreground mb-4">
                Your completed symptom checks will appear here.
              </p>
              <Link href="/chat">
                <Button>Start your first check</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {items.length} check{items.length !== 1 ? 's' : ''} recorded
            </p>

            {items.map((item) => (
              <Card key={item.assessmentId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTime(item.createdAt)}</span>
                    <span className="mx-1">·</span>
                    <User className="h-4 w-4" />
                    <span>{item.memberName}</span>
                  </div>

                  {item.symptoms.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Symptoms</p>
                      <div className="flex flex-wrap gap-1">
                        {item.symptoms.slice(0, 3).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {s.slice(0, 40)}
                            {s.length > 40 ? '...' : ''}
                          </Badge>
                        ))}
                        {item.symptoms.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.symptoms.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {item.triage && (
                    <Badge className={`${triageColors[item.triage.level]} border`}>
                      {triageLabels[item.triage.level]}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
