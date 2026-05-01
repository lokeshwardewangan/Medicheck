'use client';

import { Lightbulb, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WhyThisResultProps {
  explanation: string[];
}

export function WhyThisResult({ explanation }: WhyThisResultProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Why This Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {explanation.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {index + 1}
              </div>
              <p className="text-sm text-muted-foreground">{item}</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted p-3">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Our AI considers factors like symptom severity, duration, your age, and medical history
            to determine the appropriate level of care.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
