'use client';

import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const defaultLabels = ['Chat', 'Details', 'Review', 'Results'];

export function ProgressBar({ currentStep, totalSteps, labels = defaultLabels }: ProgressBarProps) {
  return (
    <div className="mb-8 w-full">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                } `}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
              </div>
              <span
                className={`mt-2 hidden text-xs font-medium sm:block ${isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'} `}
              >
                {labels[i]}
              </span>

              {/* Connector line */}
              {stepNumber < totalSteps && (
                <div
                  className={`absolute left-1/2 -z-10 h-0.5 w-full ${stepNumber < currentStep ? 'bg-primary' : 'bg-muted'} `}
                  style={{
                    width: `${100 / (totalSteps - 1)}%`,
                    transform: 'translateX(50%)',
                    marginTop: '20px',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile step indicator */}
      <p className="mt-4 text-center text-sm text-muted-foreground sm:hidden">
        Step {currentStep} of {totalSteps}: {labels[currentStep - 1]}
      </p>
    </div>
  );
}
