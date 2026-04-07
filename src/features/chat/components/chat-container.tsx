'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatContainerProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  showInput?: boolean;
}

export function ChatContainer({
  messages,
  onSendMessage,
  isLoading = false,
  disabled = false,
  showInput = true,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-2">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-lg font-medium mb-2">Welcome to Symptom Checker</p>
              <p className="text-sm">
                Describe your symptoms naturally, like you&apos;re talking to a doctor.
              </p>
              <p className="text-xs mt-4 text-muted-foreground">
                Examples:<br />
                &quot;I have a headache and fever for 2 days&quot;<br />
                &quot;My stomach hurts after eating&quot;<br />
                &quot;I feel dizzy when I stand up&quot;
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex justify-center py-4">
              <LoadingSpinner message="Analyzing..." size="sm" />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {showInput && (
        <div className="border-t p-4 bg-background">
          <ChatInput
            onSubmit={onSendMessage}
            isLoading={isLoading}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
