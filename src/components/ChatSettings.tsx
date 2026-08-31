import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DarkModeToggle } from './DarkModeToggle';
import { ChatHistory } from './ChatHistory';
import { PromptTemplates } from './PromptTemplates';
import { SystemPromptTemplates } from './SystemPromptTemplates';
import { ModelComparison } from './ModelComparison';
import { CodeExecution } from './CodeExecution';
import {
  Sparkles,
  Settings,
  History,
  Copy,
  Check,
  X,
  Plus,
  Edit3,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatSettingsProps {
  model: string;
  models: string[];
  temperature: number;
  numCtx: number;
  numPredict: number;
  stream: boolean;
  think: boolean;
  systemPromptContent: string;
  isEditingSystemPrompt: boolean;
  showSystemPrompts: boolean;
  showTemplates: boolean;
  showModelComparison: boolean;
  showCodeExecution: boolean;
  prompt: string;
  loading: boolean;
  responseTime: number | null;
  showTime: boolean;
  onModelChange: (value: string) => void;
  onTemperatureChange: (value: number) => void;
  onNumCtxChange: (value: number) => void;
  onNumPredictChange: (value: number) => void;
  onStreamChange: (value: boolean) => void;
  onThinkChange: (value: boolean) => void;
  onSystemPromptContentChange: (value: string) => void;
  onIsEditingSystemPromptChange: (value: boolean) => void;
  onShowSystemPromptsChange: (value: boolean) => void;
  onShowTemplatesChange: (value: boolean) => void;
  onShowModelComparisonChange: (value: boolean) => void;
  onShowCodeExecutionChange: (value: boolean) => void;
  onPromptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClearMessages: () => void;
}

export function ChatSettings({
  model,
  models,
  temperature,
  numCtx,
  numPredict,
  stream,
  think,
  systemPromptContent,
  isEditingSystemPrompt,
  showSystemPrompts,
  showTemplates,
  showModelComparison,
  showCodeExecution,
  prompt,
  loading,
  responseTime,
  showTime,
  onModelChange,
  onTemperatureChange,
  onNumCtxChange,
  onNumPredictChange,
  onStreamChange,
  onThinkChange,
  onSystemPromptContentChange,
  onIsEditingSystemPromptChange,
  onShowSystemPromptsChange,
  onShowTemplatesChange,
  onShowModelComparisonChange,
  onShowCodeExecutionChange,
  onPromptChange,
  onSubmit,
  onClearMessages,
}: ChatSettingsProps) {
  return (
    <div className="w-full md:w-1/2 lg:w-1/3 bg-card rounded-lg p-4 flex flex-col space-y-4 max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-medium">Chat Settings</h2>
        <DarkModeToggle />
      </div>

      {/* System Prompt */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base md:text-sm font-medium text-blue-900">System Prompt</h3>
            <Button
              onClick={() => onIsEditingSystemPromptChange(!isEditingSystemPrompt)}
              className="text-sm md:text-xs bg-blue-600 text-white px-3 py-1.5 md:px-2 md:py-1 rounded hover:bg-blue-700 transition-colors min-h-[36px] md:min-h-0 justify-end"
            >
              {isEditingSystemPrompt ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <SystemPromptTemplates
            currentPrompt={systemPromptContent}
            onSelectTemplate={(content) => {
              onSystemPromptContentChange(content);
              onIsEditingSystemPromptChange(true);
              onShowSystemPromptsChange(false);
            }}
            open={showSystemPrompts}
            onOpenChange={onShowSystemPromptsChange}
          />
        </div>

        {!isEditingSystemPrompt ? (
          <div className="relative">
            <p className="text-sm md:text-xs text-blue-800 font-mono bg-white p-3 rounded border border-blue-200 max-h-32 overflow-y-auto">
              {systemPromptContent.split(' ').slice(0, 30).join(' ')}...
            </p>
            <button
              onClick={() => onIsEditingSystemPromptChange(true)}
              className="absolute top-1 right-1 text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={systemPromptContent}
              onChange={(e) => onSystemPromptContentChange(e.target.value)}
              className="w-full h-32 text-sm md:text-xs font-mono p-3 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter system prompt for code generation..."
            />
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  onSystemPromptContentChange('You are an expert software engineer. When writing or reviewing code: Prioritize correctness, readability, maintainability, and simplicity.');
                }}
                className="px-3 py-1.5 text-sm md:text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors min-h-[36px] md:min-h-0"
              >
                Reset to Default
              </Button>
              <Button
                onClick={() => {
                  // Save to localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('ollama_chat_system_prompt', systemPromptContent);
                  }
                  onIsEditingSystemPromptChange(false);
                }}
                className="px-3 py-1.5 text-sm md:text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors min-h-[36px] md:min-h-0"
              >
                Save Prompt
              </Button>
            </div>
          </div>
        )}

        <div className="mt-2 text-sm md:text-xs text-blue-700">
          <strong>Purpose:</strong> This system prompt guides how the AI generates code. Modify it to customize behavior.
        </div>
      </div>

      {/* Chat History */}
      <div className="flex items-center justify-between">
        <ChatHistory
          currentMessages={[]}
          currentSettings={{
            model,
            temperature,
            numPredict,
            numCtx,
          }}
          open={false}
          onOpenChange={() => {}}
          onLoad={() => {}}
          onClear={onClearMessages}
        />
      </div>

      {/* Prompt Templates */}
      <div className="flex items-center justify-between">
        <PromptTemplates
          open={showTemplates}
          onOpenChange={onShowTemplatesChange}
          onSelectTemplate={(content) => onPromptChange(content)}
        />
      </div>

      {/* Model Comparison */}
      <div className="flex items-center justify-between">
        <ModelComparison
          models={models}
          defaultModel={model}
          systemPrompt={systemPromptContent}
          temperature={temperature}
          numPredict={numPredict}
          numCtx={numCtx}
          open={showModelComparison}
          onOpenChange={onShowModelComparisonChange}
        />
      </div>

      {/* Code Execution */}
      <div className="flex items-center justify-between">
        <CodeExecution
          open={showCodeExecution}
          onOpenChange={onShowCodeExecutionChange}
        />
      </div>

      {/* Chat Form */}
      <form onSubmit={onSubmit} className="space-y-4 md:space-y-3">
        <div>
          <label className="block text-base md:text-sm font-medium">Model</label>
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background p-2.5 md:p-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] md:min-h-0"
          >
            {models.map(modelName => (
              <option key={modelName} value={modelName}>{modelName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-base md:text-sm font-medium">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            name="prompt"
            className="mt-1 block w-full rounded-md border border-input bg-background p-2.5 md:p-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            placeholder="Enter your prompt here..."
            rows={10}
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex flex-col">
            <label className="text-sm md:text-xs font-medium">Stream</label>
            <div className="mt-1.5 flex items-center">
              <input
                type="checkbox"
                checked={stream}
                onChange={(e) => onStreamChange(e.target.checked)}
                className="h-4 w-4 md:h-5 md:w-5"
              />
              <span className="ml-2 text-sm md:text-xs">Enable streaming response</span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm md:text-xs font-medium">Think</label>
            <div className="mt-1.5 flex items-center">
              <input
                type="checkbox"
                checked={think}
                onChange={(e) => onThinkChange(e.target.checked)}
                className="h-4 w-4 md:h-5 md:w-5"
              />
              <span className="ml-2 text-sm md:text-xs">Enable thinking response</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col">
            <label className="text-sm md:text-xs font-medium">Temperature</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
              className="mt-1 block w-full h-2 md:h-2.5"
            />
            <div className="mt-1 text-xs text-gray-500">
              {temperature} ({Math.round(temperature * 10)}0%)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm md:text-xs font-medium">Num Predict</label>
            <select
              value={numPredict}
              onChange={(e) => onNumPredictChange(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm md:text-xs md:p-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="512">512 tokens</option>
              <option value="1024">1024 tokens</option>
              <option value="2048">2048 tokens</option>
              <option value="4096">4096 tokens</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm md:text-xs font-medium">Num CTX</label>
            <select
              value={numCtx}
              onChange={(e) => onNumCtxChange(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm md:text-xs md:p-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="4096">4096 tokens</option>
              <option value="8192">8192 tokens</option>
            </select>
          </div>
        </div>

        <div className="flex items-end">
          <Button
            type="submit"
            disabled={loading}
            className="self-end bg-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors min-h-[40px] md:min-h-0"
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>

      {showTime && responseTime !== null && (
        <div className="mt-2 p-2 bg-secondary/10 rounded-md text-xs text-secondary">
          Response time: {(responseTime / 1000).toFixed(2)} s
        </div>
      )}
    </div>
  );
}