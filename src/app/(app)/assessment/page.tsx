'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/features/assessment/components/progress-bar';
import { FollowUpQuestionComponent } from '@/features/assessment/components/follow-up-question';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorRetry } from '@/components/shared/error-retry';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAssessmentStore } from '@/features/assessment/store/assessment-store';
import { requestFollowUpQuestions } from '@/features/assessment/lib/follow-up-client';
import type { FollowUpQuestion, Symptom } from '@/types';

// Default questions if API fails
const defaultQuestions: FollowUpQuestion[] = [
  {
    id: 'duration',
    question: 'How long have you been experiencing these symptoms?',
    type: 'single_choice',
    options: ['Less than a day', '1-3 days', '1 week', 'More than a week', 'More than a month'],
    required: true,
    category: 'duration',
  },
  {
    id: 'severity',
    question: 'How severe are your symptoms?',
    type: 'single_choice',
    options: ['Mild (1-3)', 'Moderate (4-6)', 'Severe (7-8)', 'Very Severe (9-10)'],
    required: true,
    category: 'severity',
  },
  {
    id: 'progression',
    question: 'Are your symptoms getting better, worse, or staying the same?',
    type: 'single_choice',
    options: ['Getting better', 'Staying the same', 'Getting worse', 'Comes and goes'],
    required: true,
    category: 'other',
  },
];

export default function AssessmentPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    symptoms,
    followUpQuestions,
    followUpAnswers,
    setFollowUpQuestions,
    answerQuestion,
    setStep,
    setStatus,
    chatMessages,
  } = useAssessmentStore();

  useEffect(() => {
    setStep(2);
    setStatus('assessing');
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Extract symptoms from chat
      const extractedSymptoms: Symptom[] = chatMessages
        .filter((m) => m.role === 'user')
        .map((m, i) => ({
          id: `symptom-${i}`,
          name: m.content.slice(0, 50),
          severity: 5,
          duration: 'unknown',
        }));

      if (extractedSymptoms.length === 0) {
        // Use default questions
        setFollowUpQuestions(defaultQuestions);
      } else {
        const questions = await requestFollowUpQuestions(
          extractedSymptoms.map((s) => ({ name: s.name, bodyPart: s.bodyPart })),
          {}
        );
        setFollowUpQuestions(questions.length > 0 ? questions : defaultQuestions);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('Failed to load assessment questions. Using default questions.');
      setFollowUpQuestions(defaultQuestions);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const currentQuestion = followUpQuestions[currentQuestionIndex];
    answerQuestion(currentQuestion.id, answer);

    // Move to next question or finish
    if (currentQuestionIndex < followUpQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, go to summary
      router.push('/summary');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      router.push('/chat');
    }
  };

  const handleSkip = () => {
    router.push('/summary');
  };

  if (isGenerating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Preparing your assessment..." />
      </div>
    );
  }

  const currentQuestion = followUpQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / followUpQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">Assessment Questions</h1>
          <p className="text-muted-foreground">Help us understand your symptoms better</p>
        </div>

        {/* Progress */}
        <ProgressBar currentStep={2} totalSteps={4} />

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQuestionIndex + 1} of {followUpQuestions.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {error && <ErrorRetry message={error} onDismiss={() => setError(null)} />}

        {/* Question Card — key on question id forces a fresh component
            instance per question so internal input state doesn't leak. */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <FollowUpQuestionComponent
                key={currentQuestion.id}
                question={currentQuestion}
                onAnswer={handleAnswer}
                currentAnswer={followUpAnswers[currentQuestion.id]}
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            ← Previous
          </Button>
          <Button variant="ghost" onClick={handleSkip}>
            Skip to Summary
          </Button>
        </div>
      </div>
    </div>
  );
}
