'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/features/assessment/components/progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAssessmentStore } from '@/features/assessment/store/assessment-store';
import { Edit, CheckCircle, AlertCircle } from 'lucide-react';

export default function SummaryPage() {
  const router = useRouter();

  const { chatMessages, followUpAnswers, followUpQuestions, setStep, setStatus } =
    useAssessmentStore();

  useEffect(() => {
    setStep(3);
    setStatus('summarizing');
  }, []);

  const handleEdit = (section: string) => {
    if (section === 'chat') {
      router.push('/chat');
    } else if (section === 'assessment') {
      router.push('/assessment');
    }
  };

  const handleSubmit = () => {
    router.push('/results');
  };

  const userMessages = chatMessages.filter((m) => m.role === 'user');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">Review Your Information</h1>
          <p className="text-muted-foreground">
            Please review your symptoms before submitting for analysis
          </p>
        </div>

        {/* Progress */}
        <ProgressBar currentStep={3} totalSteps={4} />

        {/* Symptoms Summary */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-primary" />
              Reported Symptoms
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleEdit('chat')}>
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            {userMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No symptoms reported</p>
            ) : (
              <div className="space-y-3">
                {userMessages.map((message, index) => (
                  <div key={message.id} className="flex items-start gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <p className="text-sm">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assessment Answers */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-primary" />
              Additional Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleEdit('assessment')}>
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            {Object.keys(followUpAnswers).length === 0 ? (
              <p className="text-sm text-muted-foreground">No additional details provided</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(followUpAnswers).map(([key, value]) => {
                  const question = followUpQuestions.find((q) => q.id === key);
                  return (
                    <div key={key} className="flex items-start justify-between">
                      <span className="text-sm text-muted-foreground">
                        {question?.question || key}
                      </span>
                      <Badge variant="outline" className="ml-4 shrink-0">
                        {value}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Disclaimer */}
        <div className="mb-6 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Important:</strong> By continuing, you understand that this tool provides
            general guidance only and is not a substitute for professional medical advice,
            diagnosis, or treatment.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/assessment')}>
            ← Go Back
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            Get Assessment Results
          </Button>
        </div>
      </div>
    </div>
  );
}
