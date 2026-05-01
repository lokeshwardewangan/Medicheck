'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatContainer } from '@/features/chat/components/chat-container';
import { RedFlagAlert } from '@/features/triage/components/red-flag-alert';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useAssessmentStore } from '@/features/assessment/store/assessment-store';
import {
  checkEmergencyKeywords,
  extractEmergencySymptoms,
} from '@/features/triage/data/emergency-keywords';
import { sendChatMessage } from '@/features/chat/lib/chat-client';
import type { ChatMessage } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [emergencySymptoms, setEmergencySymptoms] = useState<string[]>([]);

  const { chatMessages, addChatMessage, isLoading, setLoading, setStatus, setStep } =
    useAssessmentStore();

  useEffect(() => {
    setStatus('chatting');
    setStep(1);

    // Add welcome message if empty
    if (chatMessages.length === 0) {
      addChatMessage({
        id: 'welcome',
        role: 'assistant',
        content:
          "Hello! I'm here to help you understand your symptoms. Please describe what you're experiencing in your own words.",
        timestamp: new Date(),
        isEmergency: false,
      });
    }
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Check for emergency keywords first
      if (checkEmergencyKeywords(content)) {
        const symptoms = extractEmergencySymptoms(content);
        setEmergencySymptoms(symptoms);
        setShowEmergencyAlert(true);
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      addChatMessage(userMessage);

      setLoading(true);

      try {
        const conversation = [
          ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content },
        ];

        const response = await sendChatMessage(conversation);

        addChatMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          isEmergency: response.isEmergency,
        });
      } catch (error) {
        console.error('Chat error:', error);
        addChatMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I apologize, but I'm having trouble processing your message. Please try again or continue to the assessment.",
          timestamp: new Date(),
        });
      } finally {
        setLoading(false);
      }
    },
    [chatMessages, addChatMessage, setLoading]
  );

  const handleContinue = () => {
    router.push('/assessment');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex h-screen max-w-3xl flex-col px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Symptom Check</h1>
            <p className="text-sm text-muted-foreground">Step 1: Describe your symptoms</p>
          </div>
          <button onClick={handleContinue} className="text-sm text-primary hover:underline">
            Skip to Assessment →
          </button>
        </div>

        {/* Emergency Alert */}
        {showEmergencyAlert && (
          <div className="mb-4">
            <RedFlagAlert
              symptoms={emergencySymptoms}
              onDismiss={() => setShowEmergencyAlert(false)}
            />
          </div>
        )}

        {/* Chat */}
        <div className="flex-1 overflow-hidden rounded-lg border bg-card">
          <ChatContainer
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Continue Button */}
        {chatMessages.length > 2 && (
          <div className="mt-4 text-center">
            <button
              onClick={handleContinue}
              className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Continue to Detailed Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
