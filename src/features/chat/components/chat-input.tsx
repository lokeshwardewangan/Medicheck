'use client';

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const MAX_LENGTH = 1000;
const MAX_ROWS = 6;

export function ChatInput({
  onSubmit,
  isLoading = false,
  placeholder = 'Describe your symptoms...',
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea up to MAX_ROWS lines.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(ta).lineHeight || '20');
    const maxHeight = lineHeight * MAX_ROWS;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [message]);

  const submit = () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading || disabled) return;
    onSubmit(trimmed);
    setMessage('');
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const isSendable = message.trim().length > 0 && !isLoading && !disabled;
  const showCounter = message.length > MAX_LENGTH * 0.8;

  return (
    <form onSubmit={handleFormSubmit} className="mx-auto w-full max-w-3xl">
      <div className="group relative flex items-end gap-2 rounded-2xl border bg-card px-3 py-2 shadow-sm transition-all focus-within:border-teal-400 focus-within:shadow-md focus-within:ring-2 focus-within:ring-teal-100 dark:focus-within:border-teal-600 dark:focus-within:ring-teal-950">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="max-h-40 min-h-6 flex-1 resize-none bg-transparent py-1.5 text-sm leading-6 placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!isSendable}
          aria-label="Send message"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-linear-to-br from-teal-600 to-cyan-600 text-white shadow-sm transition-all hover:from-teal-700 hover:to-cyan-700 hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none dark:disabled:from-slate-700 dark:disabled:to-slate-700"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span>
          Press <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to
          send &middot;{' '}
          <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">Shift+Enter</kbd> for
          new line
        </span>
        {showCounter && (
          <span className={message.length >= MAX_LENGTH ? 'text-red-500' : ''}>
            {message.length}/{MAX_LENGTH}
          </span>
        )}
      </div>
    </form>
  );
}
