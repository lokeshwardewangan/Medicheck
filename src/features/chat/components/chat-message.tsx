'use client';

import { User, Stethoscope, AlertTriangle } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex gap-3 py-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-white shadow-sm ${
          isUser
            ? 'bg-linear-to-br from-slate-700 to-slate-900'
            : 'bg-linear-to-br from-teal-500 to-cyan-600'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
      </div>

      <div className={`flex max-w-[78%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-tr-sm bg-linear-to-br from-teal-600 to-cyan-600 text-white'
              : message.isEmergency
                ? 'rounded-tl-sm border border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100'
                : 'rounded-tl-sm border bg-card text-foreground'
          }`}
        >
          {message.isEmergency && (
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
              <AlertTriangle className="h-3.5 w-3.5" />
              Emergency detected
            </div>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="mt-1 px-1 text-[10px] text-muted-foreground">{time}</span>
      </div>
    </div>
  );
}
