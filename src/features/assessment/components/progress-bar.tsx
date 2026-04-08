'use client';

import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const defaultLabels = ['Chat', 'Details', 'Review', 'Results'];

export function ProgressBar({
  currentStep,
  totalSteps,
  labels = defaultLabels,
}: ProgressBarProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium hidden sm:block
                  ${isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'}
                `}
              >
                {labels[i]}
              </span>

              {/* Connector line */}
              {stepNumber < totalSteps && (
                <div
                  className={`
                    absolute left-1/2 w-full h-0.5 -z-10
                    ${stepNumber < currentStep ? 'bg-primary' : 'bg-muted'}
                  `}
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
      <p className="text-center text-sm text-muted-foreground mt-4 sm:hidden">
        Step {currentStep} of {totalSteps}: {labels[currentStep - 1]}
      </p>
    </div>
  );
}
