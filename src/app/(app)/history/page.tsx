'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHistoryStore } from '@/features/history/store/history-store';
import { Calendar, Trash2, ChevronRight, Stethoscope } from 'lucide-react';
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

export default function HistoryPage() {
  const router = useRouter();
  const { histories, deleteHistory, clearAllHistory } = useHistoryStore();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Your Health History</h1>
            <p className="text-muted-foreground">
              Review your past symptom checks
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>
            ← Back
          </Button>
        </div>

        {histories.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No History Yet</h3>
              <p className="text-muted-foreground mb-4">
                Your symptom check history will appear here
              </p>
              <Button onClick={() => router.push('/chat')}>
                Start Your First Check
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {histories.length} check{histories.length !== 1 ? 's' : ''} recorded
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllHistory}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-4">
                {histories.map((history) => (
                  <Card key={history.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {formatDate(history.createdAt)} at {formatTime(history.createdAt)}
                            </span>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Symptoms:</p>
                            <div className="flex flex-wrap gap-1">
                              {history.symptoms.slice(0, 3).map((symptom, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {symptom.slice(0, 30)}{symptom.length > 30 ? '...' : ''}
                                </Badge>
                              ))}
                              {history.symptoms.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{history.symptoms.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Badge
                            className={`${triageColors[history.triageLevel]} border`}
                          >
                            {triageLabels[history.triageLevel]}
                          </Badge>

                          {history.feedback && (
                            <p className="text-xs text-muted-foreground mt-2">
                              You marked this as {history.feedback.replace('_', ' ')}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteHistory(history.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}
