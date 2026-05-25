'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/features/assessment/components/progress-bar';
import { TriageCard } from '@/features/triage/components/triage-card';
import { WhyThisResult } from '@/features/triage/components/why-this-result';
import { NextStepsChecklist } from '@/features/triage/components/next-steps-checklist';
import { FeedbackButtons } from '@/features/triage/components/feedback-buttons';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorRetry } from '@/components/shared/error-retry';
import { Button } from '@/components/ui/button';
import { useAssessmentStore } from '@/features/assessment/store/assessment-store';
import { submitAssessment } from '@/features/assessment/server/actions';
import type { TriageResult } from '@/types';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    chatMessages,
    followUpAnswers,
    triageResult: cachedTriage,
    setTriageResult,
    setStep,
    setStatus,
    newChat,
  } = useAssessmentStore();

  const generateResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const hasUserContent = chatMessages.some((m) => m.role === 'user');
    if (!hasUserContent) {
      setError('No symptoms were captured. Please describe what you’re experiencing first.');
      setIsLoading(false);
      return;
    }

    try {
      // Pass the raw chat transcript so the AI reasons from the patient's
      // own words. We no longer fabricate "symptoms" with severity 5 — the
      // server prompt makes the model extract them from the conversation.
      const { triage } = await submitAssessment({
        chatMessages: chatMessages.map((m) => ({
          role: m.role,
          content: m.content,
          isEmergency: m.isEmergency,
        })),
        symptoms: [],
        followUpAnswers,
      });

      setResult(triage);
      setTriageResult(triage);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate assessment. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [chatMessages, followUpAnswers, setTriageResult]);

  useEffect(() => {
    setStep(4);
    setStatus('complete');

    // If a triage result is already cached (just generated, or persisted across
    // a refresh), show it immediately — don't re-call the AI.
    if (cachedTriage) {
      setResult(cachedTriage);
      setIsLoading(false);
      return;
    }

    generateResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFeedback = (feedback: 'helpful' | 'not_helpful') => {
    // Could send to analytics or backend
    console.log('Feedback:', feedback);
  };

  const handleNewCheck = () => {
    newChat();
    router.push('/chat');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const hasUserMessages = chatMessages.some((m) => m.role === 'user');

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-200px)] items-center justify-center p-4">
        <LoadingSpinner
          size="lg"
          message="Analyzing your symptoms…"
          hint="This usually takes a few seconds."
        />
      </div>
    );
  }

  if (error || !result) {
    // Empty state — no chat input ever happened. Don't show a scary error,
    // just guide them to start.
    if (!hasUserMessages) {
      return (
        <div className="flex min-h-[calc(100dvh-200px)] items-center justify-center p-4">
          <div className="max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">No assessment yet</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Start by describing your symptoms in the chat. Once you&apos;ve answered a few
              questions, your results will appear here.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="outline" onClick={handleGoHome}>
                ← Back to Home
              </Button>
              <Button onClick={handleNewCheck}>Start Symptom Check</Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-[calc(100dvh-200px)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ErrorRetry
            title="Couldn’t generate your results"
            message={error || 'Something went wrong on our end.'}
            onRetry={generateResults}
            onDismiss={handleGoHome}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">Your Assessment Results</h1>
          <p className="text-muted-foreground">Based on the information you provided</p>
        </div>

        {/* Progress */}
        <ProgressBar currentStep={4} totalSteps={4} />

        {/* Triage Result */}
        <div className="mb-6">
          <TriageCard level={result.level} title={result.title} description={result.description} />
        </div>

        {/* Why This Result */}
        <div className="mb-6">
          <WhyThisResult explanation={result.explanation} />
        </div>

        {/* Next Steps */}
        <div className="mb-6">
          <NextStepsChecklist steps={result.nextSteps} />
        </div>

        {/* Disclaimer */}
        <div className="mb-6 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">{result.disclaimer}</p>
        </div>

        {/* Feedback */}
        <FeedbackButtons onFeedback={handleFeedback} />

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-4 border-t pt-6 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={handleGoHome}>
            ← Back to Home
          </Button>
          <Button className="flex-1" onClick={handleNewCheck}>
            Start New Check
          </Button>
        </div>
      </div>
    </div>
  );
}
