'use client';

import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatContainerProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  showInput?: boolean;
}

const SUGGESTIONS = [
  'I have a headache and fever for 2 days',
  'My stomach hurts after eating',
  'I feel dizzy when I stand up',
];

export function ChatContainer({
  messages,
  onSendMessage,
  isLoading = false,
  disabled = false,
  showInput = true,
}: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Messages — only this scrolls */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h2 className="mb-2 text-xl font-semibold tracking-tight">
              How are you feeling today?
            </h2>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              Describe your symptoms naturally — when they started, how they feel, anything
              you&apos;ve noticed.
            </p>
            <div className="grid w-full max-w-md gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSendMessage(s)}
                  disabled={isLoading || disabled}
                  className="rounded-xl border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-all hover:border-teal-200 hover:bg-teal-50/50 hover:text-foreground hover:shadow-sm dark:hover:border-teal-900 dark:hover:bg-teal-950/20"
                >
                  &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-teal-500 [animation-delay:200ms]" />
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-teal-500 [animation-delay:400ms]" />
                <span className="ml-2">Thinking&hellip;</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input — pinned to bottom */}
      {showInput && (
        <div className="flex-none border-t bg-white/95 px-4 pt-3 pb-4 backdrop-blur-sm sm:px-6 dark:bg-slate-950/95">
          <ChatInput onSubmit={onSendMessage} isLoading={isLoading} disabled={disabled} />
        </div>
      )}
    </div>
  );
}
