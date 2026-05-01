'use client';

import { useState } from 'react';
import { Check, Phone, MapPin, Stethoscope, Pill, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { NextStep } from '@/types';

interface NextStepsChecklistProps {
  steps: NextStep[];
}

const iconMap: Record<string, React.ReactNode> = {
  phone: <Phone className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />,
  doctor: <Stethoscope className="h-4 w-4" />,
  pill: <Pill className="h-4 w-4" />,
  activity: <Activity className="h-4 w-4" />,
};

export function NextStepsChecklist({ steps }: NextStepsChecklistProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  // Sort by priority
  const sortedSteps = [...steps].sort((a, b) => a.priority - b.priority);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Next Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${step.isEmergency ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 'border-border'} ${completedSteps.has(step.id) ? 'opacity-60' : ''} `}
            >
              <Checkbox
                checked={completedSteps.has(step.id)}
                onCheckedChange={() => toggleStep(step.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${step.isEmergency ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'} `}
                  >
                    {index + 1}
                  </span>
                  <p
                    className={`font-medium ${
                      completedSteps.has(step.id) ? 'text-muted-foreground line-through' : ''
                    }`}
                  >
                    {step.action}
                  </p>
                </div>
                {step.details && (
                  <p className="mt-1 ml-7 text-sm text-muted-foreground">{step.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {completedSteps.size > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {completedSteps.size} of {steps.length} completed
            </p>
            {completedSteps.size === steps.length && (
              <p className="mt-1 text-sm font-medium text-green-600">
                Great job! You&apos;ve completed all steps.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
