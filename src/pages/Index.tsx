import { useState, useEffect, useCallback } from 'react';
import { Chat } from '../components/Chat';

const DEFAULT_SYSTEM_PROMPT = "You are an expert software engineer. When writing or reviewing code: Prioritize correctness, readability, maintainability, and simplicity. Follow established software engineering best practices. Prefer efficient solutions without unnecessary complexity. Consider edge cases and potential failure modes. Do not invent APIs, libraries, or facts. If uncertain, state the uncertainty. Provide concise explanations of important technical decisions. When requirements are ambiguous, state your assumptions before proceeding. Return production-ready code unless explicitly asked for a prototype. Follow the user's requested output format exactly. Do not add explanations, comments, Markdown fences, or additional text unless explicitly requested.";

export default function Index() {
  // State for settings
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
  const [systemPromptContent, setSystemPromptContent] = useState<string>(DEFAULT_SYSTEM_PROMPT);
  
  const saveSystemPrompt = () => {
    localStorage.setItem('ollama_chat_system_prompt', systemPromptContent);
    setIsEditingSystemPrompt(false);
  };
  
  const resetSystemPrompt = () => {
    setSystemPromptContent(DEFAULT_SYSTEM_PROMPT);
    localStorage.removeItem('ollama_chat_system_prompt');
  };
  
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
        setModels(['phi:2.7b']); // Fallback
      }
    }
    fetchModels();
  }, []);
  
  // Handle form submission
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
      const response = await generateText({
        model,
        prompt,
        stream,
        think,
        numCtx: parseInt(numCtx as string),
        temperature,
        numPredict: parseInt(numPredict as string),
        systemPrompt: systemPromptContent,
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const botMessage: Message = {
        role: 'assistant',
        content: response,
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
  
  // Generate text request to Ollama API
  const generateText = async ({
    model,
    prompt,
    stream,
    think,
    numCtx,
    temperature,
    numPredict,
    systemPrompt,
  }: {
    model: string;
    prompt: string;
    stream: boolean;
    think: boolean;
    numCtx: number;
    temperature: number;
    numPredict: number;
    systemPrompt: string;
  }) => {
    // Show thinking animation if think is enabled
    if (think) {
      // In a real app, this would be a visual indicator
      console.log('Model is thinking...');
    }
    
    const body = {
      model,
      system: systemPrompt,
      prompt,
      stream,
      think,
      options: {
        num_ctx: numCtx,
        temperature,
        num_predict: numPredict,
      },
    };
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    // Parse the JSON response and extract the "response" field
    const data = await response.json();
    const apiResponse = data.response || data.text || JSON.stringify(data);
    
    // Handle streaming response
    if (stream) {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read response body');
      }
      
      let done = false;
      let fullResponse = '';
      
      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) {
          done = true;
        } else {
          const chunk = new TextDecoder().decode(value);
          fullResponse += chunk;
          // Display chunk as it arrives (in a real app, this would update UI incrementally)
          console.log('Chunk received:', chunk);
        }
      }
      
      return fullResponse;
    } else {
      // Non-streaming response
      return apiResponse;
    }
  };
  
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
          <div className="w-1/2 bg-card rounded-lg p-4 flex flex-col space-y-4">
            <h2 className="text-lg font-medium">Chat Settings</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-blue-900">System Prompt (for Code Generation)</h3>
                <button
                  onClick={() => setIsEditingSystemPrompt(!isEditingSystemPrompt)}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  {isEditingSystemPrompt ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              {!isEditingSystemPrompt ? (
                <div className="relative">
                  <p className="text-xs text-blue-800 font-mono bg-white p-3 rounded border border-blue-200 max-h-32 overflow-y-auto">
                    {systemPromptContent.split(' ').slice(0, 30).join(' ')}...
                  </p>
                  <button
                    onClick={() => setIsEditingSystemPrompt(true)}
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
                    onChange={(e) => setSystemPromptContent(e.target.value)}
                    className="w-full h-32 text-xs font-mono p-3 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter system prompt for code generation..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={resetSystemPrompt}
                      className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      Reset to Default
                    </button>
                    <button
                      onClick={saveSystemPrompt}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Save Prompt
                    </button>
                  </div>
                </div>
              )}
              <div className="mt-2 text-xs text-blue-700">
                <strong>Purpose:</strong> This system prompt guides how the AI generates code. Modify it to customize behavior (e.g., "Focus on Rust performance", "Write tests", "Explain algorithms")
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {models.map(modelName => (
                    <option key={modelName} value={modelName}>{modelName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                  placeholder="Enter your prompt here..."
                  rows={15}
                />
              </div>
              
              <div className="flex space-x-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium">Stream</label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={stream}
                      onChange={(e) => setStream(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm">Enable streaming response</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium">Think</label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={think}
                      onChange={(e) => setThink(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm">Enable thinking response</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium">Temperature</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="mt-1 block w-full"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {temperature} ({Math.round(temperature * 10)}0%)
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium">Num Predict</label>
                  <select
                    value={numPredict}
                    onChange={(e) => setNumPredict(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="512">512 tokens</option>
                    <option value="1024">1024 tokens</option>
                    <option value="2048">2048 tokens</option>
                    <option value="4096">4096 tokens</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium">Num CTX</label>
                  <select
                    value={numCtx}
                    onChange={(e) => setNumCtx(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="4096">4096 tokens</option>
                    <option value="8192">8192 tokens</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="self-end bg-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
            
            {showTime && responseTime !== null && (
              <div className="mt-2 p-2 bg-secondary/10 rounded-md text-xs text-secondary">
                Response time: {(responseTime / 1000).toFixed(2)} s
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}