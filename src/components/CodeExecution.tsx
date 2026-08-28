import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Terminal,
  Copy,
  Check,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';

type Language = 'javascript';

interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

interface CodeExecutionProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CodeExecution({ open, onOpenChange }: CodeExecutionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    setInternalIsOpen(val);
  };

  const [language] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<ExecutionResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Worker for safe JavaScript execution
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      // Clean JavaScript for Web Worker - no TypeScript syntax
      const workerCode = `
        self.onmessage = function(e) {
          const { code } = e.data;
          
          // Capture console output
          var logs = [];
          var originalLog = console.log;
          var originalError = console.error;
          var originalWarn = console.warn;
          var originalInfo = console.info;
          
          console.log = function() {
            logs.push({ type: 'log', args: Array.from(arguments).map(String) });
            originalLog.apply(console, arguments);
          };
          console.error = function() {
            logs.push({ type: 'error', args: Array.from(arguments).map(String) });
            originalError.apply(console, arguments);
          };
          console.warn = function() {
            logs.push({ type: 'warn', args: Array.from(arguments).map(String) });
            originalWarn.apply(console, arguments);
          };
          console.info = function() {
            logs.push({ type: 'info', args: Array.from(arguments).map(String) });
            originalInfo.apply(console, arguments);
          };
          
          var startTime = performance.now();
          
          try {
            var result = (function() {
              try {
                return eval(code);
              } catch (e) {
                throw e;
              }
            })();
            
            var endTime = performance.now();
            
            if (result && typeof result.then === 'function') {
              result.then(
                function (resolved) {
                  self.postMessage({
                    output: logs.length > 0 ? logs.map(function(l) { return l.args.join(' '); }).join('\\n') : (resolved !== undefined ? String(resolved) : ''),
                    executionTime: endTime - startTime,
                    isAsync: true
                  });
                },
                function (rejected) {
                  self.postMessage({
                    output: logs.length > 0 ? logs.map(function(l) { return l.args.join(' '); }).join('\\n') : '',
                    error: rejected && rejected.message ? rejected.message : String(rejected),
                    executionTime: endTime - startTime,
                    isAsync: true
                  });
                }
              );
            } else {
              self.postMessage({
                output: logs.length > 0 ? logs.map(function(l) { return l.args.join(' '); }).join('\\n') : (result !== undefined ? String(result) : ''),
                executionTime: endTime - startTime,
                isAsync: false
              });
            }
          } catch (err) {
            var endTime = performance.now();
            self.postMessage({
              output: logs.length > 0 ? logs.map(function(l) { return l.args.join(' '); }).join('\\n') : '',
              error: err && err.message ? err.message : String(err),
              executionTime: endTime - startTime,
              isAsync: false
            });
          }
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      workerRef.current = new Worker(workerUrl);
      
      workerRef.current.onmessage = (e) => {
        const { output, error, executionTime } = e.data;
        // Clear timeout when we get a response
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        const execResult: ExecutionResult = {
          output: output || '',
          error,
          executionTime,
          timestamp: new Date(),
        };
        setResult(execResult);
        setHistory(prev => [execResult, ...prev].slice(0, 50));
        setIsRunning(false);
      };
      
      workerRef.current.onerror = (err) => {
        console.error('Worker error:', err);
        const execResult: ExecutionResult = {
          output: '',
          error: 'Worker error: ' + err.message,
          executionTime: 0,
          timestamp: new Date(),
        };
        setResult(execResult);
        setHistory(prev => [execResult, ...prev].slice(0, 50));
        setIsRunning(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
      
      return () => {
        workerRef.current?.terminate();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        URL.revokeObjectURL(workerUrl);
      };
    }
  }, []);

  const handleRun = () => {
    if (!code.trim() || isRunning) return;
    
    setIsRunning(true);
    setResult(null);
    
    // Setup timeout for execution (5 seconds)
    timeoutRef.current = setTimeout(() => {
      if (isRunning) {
        const execResult: ExecutionResult = {
          output: '',
          error: 'Execution timed out (5s limit). Your code may contain an infinite loop or take too long to execute.',
          executionTime: 5000,
          timestamp: new Date(),
        };
        setResult(execResult);
        setHistory(prev => [execResult, ...prev].slice(0, 50));
        setIsRunning(false);
        // Terminate the worker if it's still running
        if (workerRef.current) {
          workerRef.current.terminate();
        }
      }
    }, 5000);
    
    // Execute in Web Worker (JavaScript only)
    if (workerRef.current) {
      workerRef.current.postMessage({ code });
    } else {
      // Fallback if Web Worker not available
      executeInMainThread();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  const executeInMainThread = () => {
    // Fallback for environments without Web Workers
    const logs: string[] = [];
    const captureConsole = (method: string) => {
      const original = (console as any)[method];
      (console as any)[method] = (...args: any[]) => {
        logs.push(args.map(String).join(' '));
        original.apply(console, args);
      };
    };
    
    captureConsole('log');
    captureConsole('error');
    captureConsole('warn');
    captureConsole('info');
    
    const startTime = performance.now();
    
    try {
      // eslint-disable-next-line no-eval
      const result = eval(code);
      const endTime = performance.now();
      
      const execResult: ExecutionResult = {
        output: logs.length > 0 ? logs.join('\\n') : (result !== undefined ? String(result) : ''),
        executionTime: endTime - startTime,
        timestamp: new Date(),
      };
      setResult(execResult);
      setHistory(prev => [execResult, ...prev].slice(0, 50));
    } catch (error) {
      const endTime = performance.now();
      const execResult: ExecutionResult = {
        output: logs.join('\\n'),
        error: (error as Error).message,
        executionTime: endTime - startTime,
        timestamp: new Date(),
      };
      setResult(execResult);
      setHistory(prev => [execResult, ...prev].slice(0, 50));
    } finally {
      setIsRunning(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  const handleCopy = async () => {
    if (result) {
      const text = result.error 
        ? `Error: ${result.error}\\n${result.output}`
        : result.output;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result) {
      const text = `// JavaScript Execution\\n// Executed: ${result.timestamp.toISOString()}\\n// Time: ${result.executionTime.toFixed(2)}ms\\n\\n${code}\\n\\n// Output:\\n${result.output}${result.error ? '\\n\\n// Error:\\n' + result.error : ''}`;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-execution-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleClear = () => {
    setCode('');
    setResult(null);
  };

  const getStarterCode = () => {
    return `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci sequence:');
for (let i = 0; i < 10; i++) {
  console.log(fibonacci(i));
}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!open && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Terminal className="w-4 h-4 mr-2" />
            Code Execution
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-green-600" />
              Code Execution Sandbox
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide History
                  </>
                ) : (
                  <>
                    History
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Panel */}
            <div className="w-full lg:w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    JavaScript
                  </span>
                  Editor
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCode(getStarterCode())}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Example
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4 relative">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Write ${language} code here...`}
                  className="font-mono text-sm h-full resize-none bg-gray-950 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', lineHeight: 1.6 }}
                  spellCheck={false}
                />
                {isRunning && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                    <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                      <Play className="w-5 h-5 text-green-600 animate-spin" />
                      <span className="text-sm font-medium">Running...</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                <Button
                  onClick={handleRun}
                  disabled={isRunning || !code.trim()}
                  className="flex-1 sm:flex-none"
                >
                  {isRunning ? (
                    <>
                      <Play className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Code
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="w-full lg:w-1/2 flex flex-col min-w-0">
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Output
                </h3>
                <div className="flex items-center gap-2">
                  {result && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  {showHistory && history.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Execution History ({history.length})
                      </h4>
                      {history.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.timestamp.toLocaleTimeString()}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.executionTime.toFixed(2)}ms
                            </span>
                          </div>
                          <pre className="font-mono text-xs whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                            {item.error ? `Error: ${item.error}\\n${item.output}` : item.output || '(no output)'}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : result ? (
                    <div className="min-h-[200px]">
                      {result.error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                            <X className="w-4 h-4" />
                            <span className="font-medium">Execution Error</span>
                          </div>
                          <pre className="font-mono text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                            {result.error}
                          </pre>
                          {result.output && (
                            <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                              <div className="text-xs text-red-500 dark:text-red-400 mb-1">Console Output:</div>
                              <pre className="font-mono text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap">
                                {result.output}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                          <pre className="whitespace-pre-wrap">{result.output || '(no output)'}</pre>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Terminal className="w-3 h-3" />
                          {result.executionTime.toFixed(2)}ms
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Completed
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Terminal className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>Write code and click Run to see output here</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}