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
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Why This Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {explanation.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {index + 1}
              </div>
              <p className="text-sm text-muted-foreground">{item}</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-start gap-2 p-3 bg-muted rounded-lg">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Our AI considers factors like symptom severity, duration, your age,
            and medical history to determine the appropriate level of care.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
