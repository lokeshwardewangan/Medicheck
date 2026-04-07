'use client';

import { User, Bot, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <Avatar className={`h-8 w-8 ${isUser ? 'bg-primary' : 'bg-muted'}`}>
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3 text-sm
          ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : message.isEmergency
              ? 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100 rounded-bl-none border border-red-300'
              : 'bg-muted text-foreground rounded-bl-none'
          }
        `}
      >
        {message.isEmergency && (
          <div className="flex items-center gap-2 mb-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Emergency Detected
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs opacity-60 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
