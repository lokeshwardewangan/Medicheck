'use client';

import { useState, FormEvent } from 'react';
import { Send, Mic, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSubmit,
  isLoading = false,
  placeholder = 'Describe your symptoms...',
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || disabled) return;

    onSubmit(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className="min-h-[80px] pr-24 resize-none"
        maxLength={1000}
      />

      <div className="absolute bottom-2 right-2 flex gap-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          disabled={true} // Voice input for future
          title="Voice input (coming soon)"
        >
          <Mic className="h-4 w-4 text-muted-foreground" />
        </Button>

        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isLoading || disabled}
          className="h-8 w-8"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mt-1 text-right">
        {message.length}/1000
      </div>
    </form>
  );
}
