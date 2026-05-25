'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { ChatContainer } from '@/features/chat/components/chat-container';
import { RedFlagAlert } from '@/features/triage/components/red-flag-alert';
import { useAssessmentStore } from '@/features/assessment/store/assessment-store';
import {
  checkEmergencyKeywords,
  extractEmergencySymptoms,
} from '@/features/triage/data/emergency-keywords';
import { sendChatMessage } from '@/features/chat/lib/chat-client';
import { Button } from '@/components/ui/button';
import type { ChatMessage } from '@/types';

// Height of navbar (h-16 = 64px) + member-switcher row (py-2 + content + border ≈ 49px)
const CHROME_OFFSET = '113px';

export default function ChatPage() {
  const router = useRouter();
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [emergencySymptoms, setEmergencySymptoms] = useState<string[]>([]);

  const { chatMessages, addChatMessage, isLoading, setLoading, setStatus, setStep } =
    useAssessmentStore();

  useEffect(() => {
    setStatus('chatting');
    setStep(1);

    if (chatMessages.length === 0) {
      addChatMessage({
        id: 'welcome',
        role: 'assistant',
        content:
          "Hi! I'm here to help you understand your symptoms. Describe what you're experiencing in your own words — when it started, how it feels, anything you've noticed.",
        timestamp: new Date(),
        isEmergency: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (checkEmergencyKeywords(content)) {
        const symptoms = extractEmergencySymptoms(content);
        setEmergencySymptoms(symptoms);
        setShowEmergencyAlert(true);
      }

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
            "I'm having trouble processing your message right now. Please try again or continue to the assessment.",
          timestamp: new Date(),
        });
      } finally {
        setLoading(false);
      }
    },
    [chatMessages, addChatMessage, setLoading]
  );

  const handleContinue = () => router.push('/assessment');
  const canContinue = chatMessages.length > 2;

  return (
    <div
      className="flex flex-col overflow-hidden bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900"
      style={{ height: `calc(100dvh - ${CHROME_OFFSET})` }}
    >
      {/* Slim header */}
      <header className="flex-none border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-cyan-600 shadow-sm">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm leading-tight font-semibold">Symptom Check</h1>
              <p className="truncate text-xs text-muted-foreground">
                Step 1 of 4 &middot; Describe your symptoms
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant={canContinue ? 'default' : 'ghost'}
            onClick={handleContinue}
            className={
              canContinue
                ? 'bg-linear-to-r from-teal-600 to-cyan-600 text-white shadow-sm hover:from-teal-700 hover:to-cyan-700'
                : ''
            }
          >
            {canContinue ? 'Continue' : 'Skip'}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Emergency Alert */}
      {showEmergencyAlert && (
        <div className="flex-none border-b bg-red-50/50 px-4 py-3 sm:px-6 dark:bg-red-950/20">
          <div className="mx-auto w-full max-w-3xl">
            <RedFlagAlert
              symptoms={emergencySymptoms}
              onDismiss={() => setShowEmergencyAlert(false)}
            />
          </div>
        </div>
      )}

      {/* Chat — fills the rest, scrolls internally */}
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        <ChatContainer
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
