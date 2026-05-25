'use client';

import { Stethoscope } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const badgeSize = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
};

const iconSize = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
};

export function LoadingSpinner({
  message = 'Loading...',
  hint,
  size = 'md',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className={`relative ${badgeSize[size]}`}>
        <span className="absolute inset-0 animate-ping rounded-2xl bg-teal-500/30" />
        <span className="absolute inset-0 animate-pulse rounded-2xl bg-linear-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30" />
        <span className="relative flex h-full w-full items-center justify-center">
          <Stethoscope className={`${iconSize[size]} text-white`} />
        </span>
      </div>

      <div className="space-y-1">
        {message && <p className="text-sm font-medium text-foreground">{message}</p>}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        <div className="flex justify-center gap-1 pt-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500 [animation-delay:200ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500 [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="p-6">{content}</div>;
}
