'use client';

import React from 'react';
import { useState, useCallback } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "./SubmitButton";
import type { AnalysisResult } from '@/types/chatexcel';
import { ExecutionResult } from './ExecutionResult';

const EXAMPLE_PROMPTS = [
  {
    text: "Calculate average salary by department",
    icon: "📊"
  },
  {
    text: "Create sales chart by city",
    icon: "📈"
  },
  {
    text: "Find duplicate customer records",
    icon: "🔍"
  },
  {
    text: "Merge multiple tables into one",
    icon: "🔄"
  }
];

interface AnalysisPanelProps {
  onSubmit: (input: string) => Promise<void>;
  disabled?: boolean;
  analyzing?: boolean;
  executing?: boolean;
  proMode?: boolean;
  onProModeChange?: (enabled: boolean) => void;
  result?: AnalysisResult | null;
  onFocus?: () => void;
}

export function AnalysisPanel({
  onSubmit,
  disabled = false,
  analyzing = false,
  executing = false,
  proMode = false,
  onProModeChange,
  result,
  onFocus,
}: AnalysisPanelProps) {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;
    await onSubmit(input.trim());
  }, [input, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handlePromptClick = useCallback((prompt: string) => {
    setInput(prompt);
  }, []);

  return (
    <div className="w-full max-w-3xl py-10 px-6 space-y-8">
      <h1 className="text-4xl font-normal text-center">
        What would you like to analyze?
      </h1>

      <div className="border rounded-[4px] focus-within:border-[#0d9488] transition-colors overflow-hidden bg-white dark:bg-neutral-800">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your data processing request..."
          disabled={analyzing}
          className="min-h-[120px] resize-none border-0 focus-visible:ring-0 bg-transparent px-4 py-4 shadow-none text-lg"
          onFocus={onFocus}
        />
        <div className="px-2 py-2 flex items-center justify-end gap-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Pro Mode
            <Switch
              checked={proMode}
              onCheckedChange={onProModeChange}
              disabled={analyzing}
              className="data-[state=checked]:bg-[#0d9488] data-[state=checked]:hover:bg-[#0d9488]/90"
            />
          </div>
          <SubmitButton
            onSubmit={handleSubmit}
            disabled={disabled}
            analyzing={analyzing}
            proMode={proMode}
            hasInput={!!input.trim()}
          />
        </div>
      </div>

      <div>
        <div className="flex items-start gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-[#0d9488] shrink-0">
            <Sparkles className="h-4 w-4 text-[#0d9488]" />
            Try this
          </div>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {EXAMPLE_PROMPTS.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-8 rounded-full shadow-none hover:bg-muted/50"
                onClick={() => handlePromptClick(prompt.text)}
              >
                <span className="mr-1">{prompt.icon}</span>
                {prompt.text}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <ExecutionResult
        result={result}
        executing={executing}
      />
    </div>
  );
} 