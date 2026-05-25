'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Check } from 'lucide-react';
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

const STEPS = [
  { id: 1, label: 'Chat' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Results' },
] as const;
const CURRENT_STEP = 1;

export default function ChatPage() {
  const router = useRouter();
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [emergencySymptoms, setEmergencySymptoms] = useState<string[]>([]);

  const { chatMessages, addChatMessage, isLoading, setLoading, setStatus, setStep, newChat } =
    useAssessmentStore();

  useEffect(() => {
    setStatus('chatting');
    setStep(1);
    // No more synthetic "welcome" message — ChatContainer renders a proper
    // empty-state hero when messages.length === 0, which avoids the React 19
    // strict-mode double-invoke that was duplicating the greeting in the chat.
  }, [setStatus, setStep]);

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
  const handleNewChat = () => {
    newChat();
    setShowEmergencyAlert(false);
    setEmergencySymptoms([]);
  };

  const userMessageCount = chatMessages.filter((m) => m.role === 'user').length;
  const canContinue = userMessageCount >= 1;
  const hasMessages = chatMessages.length > 0;

  return (
    <div
      className="flex flex-col overflow-hidden bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900"
      style={{ height: `calc(100dvh - ${CHROME_OFFSET})` }}
    >
      {/* App-shell header — distinct from chat messages: no avatar, step pills
          on the left, action cluster on the right, muted band background. */}
      <header className="flex-none border-b bg-slate-50/80 backdrop-blur-sm dark:bg-slate-900/60">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          {/* Step pills — only show on sm+; mobile gets compact label */}
          <ol className="hidden items-center gap-1 sm:flex">
            {STEPS.map((step) => {
              const isDone = step.id < CURRENT_STEP;
              const isCurrent = step.id === CURRENT_STEP;
              return (
                <li key={step.id} className="flex items-center gap-1">
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      isCurrent
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200'
                        : isDone
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'bg-transparent text-muted-foreground'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                          isCurrent
                            ? 'bg-teal-600 text-white'
                            : 'border border-current text-current'
                        }`}
                      >
                        {step.id}
                      </span>
                    )}
                    {step.label}
                  </span>
                  {step.id < STEPS.length && <span aria-hidden className="h-px w-3 bg-border" />}
                </li>
              );
            })}
          </ol>

          <div className="flex items-center gap-2 sm:hidden">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Step {CURRENT_STEP} / {STEPS.length}
            </span>
            <span className="text-sm font-semibold">{STEPS[CURRENT_STEP - 1].label}</span>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            {hasMessages && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleNewChat}
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="mr-1 h-4 w-4" />
                New chat
              </Button>
            )}

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
