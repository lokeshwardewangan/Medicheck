'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import type { FollowUpQuestion as FollowUpQuestionType } from '@/types';

interface FollowUpQuestionProps {
  question: FollowUpQuestionType;
  onAnswer: (answer: string) => void;
  currentAnswer?: string;
}

export function FollowUpQuestionComponent({
  question,
  onAnswer,
  currentAnswer,
}: FollowUpQuestionProps) {
  const [answer, setAnswer] = useState(currentAnswer || '');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    currentAnswer ? currentAnswer.split(',') : []
  );

  const handleSingleChoice = (value: string) => {
    setAnswer(value);
    onAnswer(value);
  };

  const handleMultipleChoice = (option: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedOptions, option]
      : selectedOptions.filter((o) => o !== option);
    setSelectedOptions(newSelection);
    setAnswer(newSelection.join(','));
    onAnswer(newSelection.join(','));
  };

  const handleTextSubmit = () => {
    if (answer.trim()) {
      onAnswer(answer.trim());
    }
  };

  const handleBoolean = (value: boolean) => {
    const answer = value ? 'yes' : 'no';
    setAnswer(answer);
    onAnswer(answer);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{question.question}</h3>
        {question.required && <span className="text-xs text-muted-foreground">* Required</span>}
      </div>

      {question.type === 'single_choice' && question.options && (
        <RadioGroup value={answer} onValueChange={handleSingleChoice} className="space-y-2">
          {question.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={option} />
              <Label htmlFor={option} className="cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {question.type === 'multiple_choice' && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={selectedOptions.includes(option)}
                onCheckedChange={(checked) => handleMultipleChoice(option, checked as boolean)}
              />
              <Label htmlFor={option} className="cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </div>
      )}

      {question.type === 'text' && (
        <div className="space-y-2">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
          />
          <Button onClick={handleTextSubmit} disabled={!answer.trim()} size="sm">
            Continue
          </Button>
        </div>
      )}

      {question.type === 'number' && (
        <div className="space-y-2">
          <Input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter a number..."
            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
          />
          <Button onClick={handleTextSubmit} disabled={!answer.trim()} size="sm">
            Continue
          </Button>
        </div>
      )}

      {question.type === 'boolean' && (
        <div className="flex gap-4">
          <Button
            variant={answer === 'yes' ? 'default' : 'outline'}
            onClick={() => handleBoolean(true)}
          >
            Yes
          </Button>
          <Button
            variant={answer === 'no' ? 'default' : 'outline'}
            onClick={() => handleBoolean(false)}
          >
            No
          </Button>
        </div>
      )}
    </div>
  );
}
