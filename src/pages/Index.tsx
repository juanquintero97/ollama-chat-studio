import { useState, useEffect, useCallback } from 'react';
import { Chat } from '../components/Chat';

export default function Index() {
  // State for settings
  const [model, setModel] = useState('phi:2.7b');
  const [models, setModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [stream, setStream] = useState(false);
  const [think, setThink] = useState(false);
  const [temperature, setTemperature] = useState(0.2);
  const [numPredict, setNumPredict] = useState(1024);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [showTime, setShowTime] = useState(false);

  // Fetch available models from Ollama API
  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('http://localhost:11434/v1/models');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const modelNames = data.data.map((item: { id: string }) => item.id);
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
        temperature,
        numPredict: parseInt(numPredict as string),
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
    temperature,
    numPredict,
  }: {
    model: string;
    prompt: string;
    stream: boolean;
    think: boolean;
    temperature: number;
    numPredict: number;
  }) => {
    // Show thinking animation if think is enabled
    if (think) {
      // In a real app, this would be a visual indicator
      console.log('Model is thinking...');
    }

    const body = {
      model,
      prompt,
      stream,
      think,
      options: {
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
                  rows={4}
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
                    <span className="ml-2 text-sm">Show thinking animation</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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