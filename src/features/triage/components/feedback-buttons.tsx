'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedbackButtonsProps {
  onFeedback: (feedback: 'helpful' | 'not_helpful') => void;
}

export function FeedbackButtons({ onFeedback }: FeedbackButtonsProps) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<'helpful' | 'not_helpful' | null>(null);

  const handleFeedback = (feedback: 'helpful' | 'not_helpful') => {
    setSelectedFeedback(feedback);
    setSubmitted(true);
    onFeedback(feedback);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4 text-green-500" />
        <span>Thank you for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 border-t py-4">
      <span className="text-sm text-muted-foreground">Was this helpful?</span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback('helpful')}
          className="gap-2"
        >
          <ThumbsUp className="h-4 w-4" />
          Yes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback('not_helpful')}
          className="gap-2"
        >
          <ThumbsDown className="h-4 w-4" />
          No
        </Button>
      </div>
    </div>
  );
}
