'use client';

import { AlertCircle, Phone, Ambulance } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EMERGENCY_RESPONSE } from '@/features/triage/data/emergency-keywords';

interface RedFlagAlertProps {
  symptoms: string[];
  onDismiss?: () => void;
}

export function RedFlagAlert({ symptoms, onDismiss }: RedFlagAlertProps) {
  return (
    <Alert className="border-red-500 bg-red-50 dark:bg-red-950/30">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <AlertTitle className="flex items-center gap-2 text-lg font-bold text-red-800 dark:text-red-200">
        <Ambulance className="h-5 w-5" />
        {EMERGENCY_RESPONSE.title}
      </AlertTitle>
      <AlertDescription className="mt-2 text-red-700 dark:text-red-300">
        <p className="mb-3 font-medium">{EMERGENCY_RESPONSE.message}</p>

        {symptoms.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-semibold">Detected concerning symptoms:</p>
            <p className="text-sm">{symptoms.join(', ')}</p>
          </div>
        )}

        <div className="mb-4 space-y-2">
          {EMERGENCY_RESPONSE.actions.map((action, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="font-bold text-red-600">{index + 1}.</span>
              <span>{action}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="destructive"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => (window.location.href = 'tel:108')}
          >
            <Phone className="mr-2 h-4 w-4" />
            Call Emergency (108)
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full border-red-300 text-red-700 hover:bg-red-100 sm:w-auto"
            onClick={() => (window.location.href = 'tel:911')}
          >
            <Phone className="mr-2 h-4 w-4" />
            Call 911
          </Button>
        </div>

        <p className="mt-4 text-xs text-red-600/80">{EMERGENCY_RESPONSE.disclaimer}</p>
      </AlertDescription>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800"
        >
          ✕
        </button>
      )}
    </Alert>
  );
}
