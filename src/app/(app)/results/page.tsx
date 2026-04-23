'use client';

import { useEffect, useState } from 'react';
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
import type { TriageResult, Symptom } from '@/types';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    chatMessages,
    followUpAnswers,
    setTriageResult,
    setStep,
    setStatus,
    resetSession,
  } = useAssessmentStore();

  useEffect(() => {
    setStep(4);
    setStatus('complete');
    generateResults();
  }, []);

  const generateResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const symptoms: Symptom[] = chatMessages
        .filter((m) => m.role === 'user')
        .map((m, i) => ({
          id: `symptom-${i}`,
          name: m.content.slice(0, 100),
          severity: 5,
          duration: followUpAnswers['duration'] || 'unknown',
          description: m.content,
        }));

      const { triage } = await submitAssessment({
        chatMessages: chatMessages.map((m) => ({
          role: m.role,
          content: m.content,
          isEmergency: m.isEmergency,
        })),
        symptoms: symptoms.map((s) => ({
          name: s.name,
          bodyPart: s.bodyPart,
          severity: s.severity,
          duration: s.duration,
          description: s.description,
        })),
        followUpAnswers,
      });

      setResult(triage);
      setTriageResult(triage);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (feedback: 'helpful' | 'not_helpful') => {
    // Could send to analytics or backend
    console.log('Feedback:', feedback);
  };

  const handleNewCheck = () => {
    resetSession();
    router.push('/chat');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Analyzing your symptoms..." />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorRetry
          title="Analysis Failed"
          message={error || 'Unable to generate results'}
          onRetry={generateResults}
          onDismiss={handleGoHome}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Your Assessment Results</h1>
          <p className="text-muted-foreground">
            Based on the information you provided
          </p>
        </div>

        {/* Progress */}
        <ProgressBar currentStep={4} totalSteps={4} />

        {/* Triage Result */}
        <div className="mb-6">
          <TriageCard
            level={result.level}
            title={result.title}
            description={result.description}
          />
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
        <div className="bg-muted p-4 rounded-lg mb-6">
          <p className="text-sm text-muted-foreground">{result.disclaimer}</p>
        </div>

        {/* Feedback */}
        <FeedbackButtons onFeedback={handleFeedback} />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
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
