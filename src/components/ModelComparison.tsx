import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, GitCompare, Send, Clock, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ComparisonResult {
  model: string;
  response: string;
  responseTime: number;
  error?: string;
}

interface ModelComparisonProps {
  models: string[];
  defaultModel: string;
  systemPrompt: string;
  temperature: number;
  numPredict: number;
  numCtx: number;
  currentPrompt?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ModelComparison({
  models,
  defaultModel,
  systemPrompt,
  temperature,
  numPredict,
  numCtx,
  currentPrompt = '',
  open,
  onOpenChange,
}: ModelComparisonProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    setInternalIsOpen(val);
    if (!val) {
      setResults([]);
      setPrompt('');
      setSelectedModels([defaultModel, models.find(m => m !== defaultModel) || defaultModel]);
    }
  };

  const [selectedModels, setSelectedModels] = useState<string[]>([defaultModel, models[1] || defaultModel]);
  const [prompt, setPrompt] = useState(currentPrompt);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (currentPrompt) setPrompt(currentPrompt);
  }, [currentPrompt]);

  useEffect(() => {
    if (models.length >= 2) {
      setSelectedModels([defaultModel, models.find(m => m !== defaultModel) || models[0]]);
    }
  }, [models, defaultModel]);

  const generateText = async (model: string): Promise<{ response: string; time: number }> => {
    const startTime = Date.now();
    
    const body = {
      model,
      system: systemPrompt,
      prompt,
      stream: false,
      options: {
        num_ctx: numCtx,
        temperature,
        num_predict: numPredict,
      },
    };

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    return { response: data.response || '', time: endTime - startTime };
  };

  const handleCompare = async () => {
    if (!prompt.trim() || selectedModels.length < 2) return;

    setIsRunning(true);
    setResults([]);

    const newResults: ComparisonResult[] = [];

    for (const model of selectedModels) {
      try {
        const { response, time } = await generateText(model);
        newResults.push({ model, response, responseTime: time });
      } catch (error) {
        newResults.push({
          model,
          response: '',
          responseTime: 0,
          error: (error as Error).message,
        });
      }
      setResults([...newResults]);
    }

    setIsRunning(false);
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleModelChange = (index: number, model: string) => {
    const updated = [...selectedModels];
    updated[index] = model;
    setSelectedModels(updated);
  };

  const availableModels = models.filter(m => selectedModels.every(sm => sm === m ? true : m !== sm));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!open && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <GitCompare className="w-4 h-4 mr-2" />
            Compare Models
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-600" />
            Model Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          {/* Setup Section */}
          <div className="p-6 border-b bg-gray-50 dark:bg-gray-800/50">
            {/* Model Selectors */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium">Compare:</span>
              {selectedModels.map((model, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={model}
                    onChange={(e) => handleModelChange(index, e.target.value)}
                    className="rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {index === 0 && (
                    <span className="text-xs text-gray-500">vs</span>
                  )}
                </div>
              ))}
            </div>

            {/* Prompt Input */}
            <div className="mb-4">
              <label className="text-sm font-medium block mb-2">Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a prompt to compare models..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Compare Button */}
            <Button
              onClick={handleCompare}
              disabled={isRunning || !prompt.trim()}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running comparison...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Compare Models
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {results.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <GitCompare className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>Enter a prompt and click Compare to see side-by-side results</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {results.map((result, index) => (
                    <div
                      key={result.model}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      {/* Result Header */}
                      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{result.model}</Badge>
                          {result.error ? (
                            <Badge variant="destructive">Error</Badge>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {(result.responseTime / 1000).toFixed(2)}s
                            </span>
                          )}
                        </div>
                        {!result.error && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(result.response, index)}
                          >
                            {copiedIndex === index ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Result Content */}
                      <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                        {isRunning && results[index]?.response === '' && !results[index]?.error ? (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        ) : result.error ? (
                          <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded">
                            {result.error}
                          </div>
                        ) : (
                          <MarkdownContent content={result.response} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-600 dark:text-indigo-300"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            const language = className?.replace('language-', '') || '';
            return (
              <div className="relative group my-3">
                {language && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded font-mono">
                    {language}
                  </div>
                )}
                <pre className={`bg-gray-900 dark:bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono ${language ? 'pt-8' : ''}`}>
                  <code className={className}>{children}</code>
                </pre>
              </div>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          p({ children }) {
            return <p className="my-2 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
          },
          h1({ children }) {
            return <h1 className="text-xl font-bold my-3">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-bold my-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base font-semibold my-2">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-indigo-500 pl-4 my-2 italic text-gray-600 dark:text-gray-400">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
