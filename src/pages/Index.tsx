import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Clock, Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Chat } from '../components/Chat';
import { ChatSettings } from '../components/ChatSettings';
import { KeyboardShortcutsDialog, KeyboardShortcutsHelp } from '../components/KeyboardShortcuts';

export default function Index() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [model, setModel] = useState('phi:2.7b');
  const [models, setModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [stream, setStream] = useState(false);
  const [think, setThink] = useState(false);
  const [numCtx, setNumCtx] = useState(8192);
  const [temperature, setTemperature] = useState(0.2);
  const [numPredict, setNumPredict] = useState(1024);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [showTime, setShowTime] = useState(false);
  const [isEditingSystemPrompt, setIsEditingSystemPrompt] = useState(false);
  const [systemPromptContent, setSystemPromptContent] = useState<string>('You are an expert software engineer.');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSystemPrompts, setShowSystemPrompts] = useState(false);
  const [showModelComparison, setShowModelComparison] = useState(false);
  const [showCodeExecution, setShowCodeExecution] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  const handleSelectTemplate = useCallback((content: string) => {
    setPrompt(content);
  }, []);

  const handleSelectSystemTemplate = useCallback((content: string) => {
    setSystemPromptContent(content);
    setIsEditingSystemPrompt(true);
    setShowSystemPrompts(false);
  }, []);

  const saveSystemPrompt = () => {
    localStorage.setItem('ollama_chat_system_prompt', systemPromptContent);
    setIsEditingSystemPrompt(false);
  };

  const resetSystemPrompt = () => {
    setSystemPromptContent('You are an expert software engineer.');
    localStorage.removeItem('ollama_chat_system_prompt');
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
    setModel('phi:2.7b');
    setTemperature(0.2);
    setNumPredict(1024);
    setNumCtx(8192);
    localStorage.removeItem('ollama_chat_sessions');
  }, []);

  useEffect(() => {
    const savedPrompt = localStorage.getItem('ollama_chat_system_prompt');
    if (savedPrompt) {
      setSystemPromptContent(savedPrompt);
    }
  }, []);

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('http://localhost:11434/v1/models');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const modelNames = data.data.map((item: { id: string }) => item.id);
        modelNames.sort((a, b) => a.localeCompare(b));
        setModels(modelNames);
        if (modelNames.length > 0) {
          setModel(modelNames[0]);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        setModels(['phi:2.7b']);
      }
    }
    fetchModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    const userMessage: Message = {
      role: 'user',
      content: prompt,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setResponseTime(null);
    setShowTime(false);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream,
          think,
          num_ctx: parseInt(String(numCtx)),
          temperature,
          num_predict: parseInt(String(numPredict)),
          system: systemPromptContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      const apiResponse = data.response || data.text || JSON.stringify(data);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const botMessage: Message = {
        role: 'assistant',
        content: apiResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setResponseTime(duration);
      setShowTime(true);
    } catch (error) {
      console.error('Error generating text:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Error: ' + (error as Error).message,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setResponseTime(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMod = e.metaKey || e.ctrlKey;

    if (isMod && e.key === 'Enter') {
      e.preventDefault();
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
      return;
    }

    if (isMod && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      setShowShortcuts(prev => !prev);
      return;
    }

    if (isMod && e.key === '/') {
      e.preventDefault();
      const promptTextarea = document.querySelector('textarea[name="prompt"]') as HTMLTextAreaElement | null;
      if (promptTextarea) {
        promptTextarea.focus();
        promptTextarea.setSelectionRange(promptTextarea.value.length, promptTextarea.value.length);
      }
      return;
    }

    if (isMod && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
      setTheme(isDark ? 'light' : 'dark');
      return;
    }

    if (isMod && e.shiftKey && (e.key === 'H' || e.key === 'h')) {
      e.preventDefault();
      setShowHistoryDialog(true);
      return;
    }

    if (e.key === 'Escape') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable) {
        target.blur();
      } else {
        clearMessages();
      }
      return;
    }
  }, [theme, setTheme, systemTheme, clearMessages]);

  useEffect(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row h-full">
          {/* Chat Display */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1">
              <Chat messages={messages} loading={loading} responseTime={responseTime} showTime={showTime} />
            </div>
          </div>
          
          {/* Settings Panel */}
          <ChatSettings
            model={model}
            models={models}
            temperature={temperature}
            numCtx={numCtx}
            numPredict={numPredict}
            stream={stream}
            think={think}
            systemPromptContent={systemPromptContent}
            isEditingSystemPrompt={isEditingSystemPrompt}
            showSystemPrompts={showSystemPrompts}
            showTemplates={showTemplates}
            showModelComparison={showModelComparison}
            showCodeExecution={showCodeExecution}
            prompt={prompt}
            loading={loading}
            responseTime={responseTime}
            showTime={showTime}
            onModelChange={setModel}
            onTemperatureChange={setTemperature}
            onNumCtxChange={setNumCtx}
            onNumPredictChange={setNumPredict}
            onStreamChange={setStream}
            onThinkChange={setThink}
            onSystemPromptContentChange={setSystemPromptContent}
            onIsEditingSystemPromptChange={setIsEditingSystemPrompt}
            onShowSystemPromptsChange={setShowSystemPrompts}
            onShowTemplatesChange={setShowTemplates}
            onShowModelComparisonChange={setShowModelComparison}
            onShowCodeExecutionChange={setShowCodeExecution}
            onPromptChange={setPrompt}
            onSubmit={handleSubmit}
            onClearMessages={() => {
              setMessages([]);
            }}
            showHistoryDialog={showHistoryDialog}
            onShowHistoryDialogChange={setShowHistoryDialog}
            onSaveChatSession={() => {}}
            onLoadSession={() => {}}
          />
        </div>
      </div>
      
      {/* Keyboard Shortcuts - Help */}
      <KeyboardShortcutsHelp />
      
      {/* Keyboard Shortcuts - Dialog */}
      {showShortcuts && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowShortcuts(false)}
          />
          <KeyboardShortcutsDialog
            isOpen={showShortcuts}
            onClose={() => setShowShortcuts(false)}
          />
        </>
      )}
    </div>
  );
}

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}