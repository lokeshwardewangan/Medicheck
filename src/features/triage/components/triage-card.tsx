'use client';

import { AlertTriangle, Clock, Calendar, Home, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TriageLevel } from '@/types';

interface TriageCardProps {
  level: TriageLevel;
  title: string;
  description: string;
}

const triageConfig: Record<
  TriageLevel,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  emergency: {
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-500',
    icon: <AlertTriangle className="h-6 w-6" />,
    label: 'EMERGENCY',
  },
  urgent: {
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-500',
    icon: <Clock className="h-6 w-6" />,
    label: 'URGENT',
  },
  routine: {
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-500',
    icon: <Calendar className="h-6 w-6" />,
    label: 'ROUTINE',
  },
  self_care: {
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-500',
    icon: <Home className="h-6 w-6" />,
    label: 'SELF-CARE',
  },
};

export function TriageCard({ level, title, description }: TriageCardProps) {
  const config = triageConfig[level];

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${config.color}`}>
            {config.icon}
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={`${config.color} ${config.borderColor} border-2 font-bold`}
          >
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`${config.color} text-sm leading-relaxed`}>{description}</p>

        <div className="mt-4 p-3 bg-background/50 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              This assessment is based on the information you provided and is not a
              medical diagnosis. Always consult a healthcare professional for proper
              evaluation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
