import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Clock, Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatProps {
  messages: Message[];
  loading: boolean;
  responseTime: number | null;
  showTime: boolean;
}

export function Chat({ messages, loading, responseTime, showTime }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Code block component with copy button
  const CodeBlock = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const [copied, setCopied] = useState(false);
    const code = String(children).replace(/\n$/, '');
    const language = className?.replace('language-', '') || '';

    const handleCopy = async () => {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

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
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md opacity-0 group-hover:opacity-100 transition-all"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-300" />
          )}
        </button>
      </div>
    );
  };

  // Parse and render markdown content
  const formatMessageContent = (content: string) => (
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
          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
        pre({ children }) {
          return <>{children}</>;
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold border-b border-gray-300 dark:border-gray-600">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="px-4 py-2 text-sm border-b border-gray-200 dark:border-gray-700">
              {children}
            </td>
          );
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-indigo-500 pl-4 my-2 italic text-gray-600 dark:text-gray-400">
              {children}
            </blockquote>
          );
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
        p({ children }) {
          return <p className="my-2 leading-relaxed">{children}</p>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Chat Header - Sticky */}
      <div className="sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Chat</h2>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto max-h-[80vh] p-4 space-y-4 relative">
        {/* Scroll indicator at top when scrolled */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-5" />
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-lg rounded-br-sm dark:bg-indigo-500 dark:text-white'
                    : 'bg-gray-100 text-gray-800 rounded-lg rounded-bl-sm border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
                  } p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex items-start space-x-2">
                    <div className={`flex-shrink-0 ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      {message.role === 'user' ? (
                        <div className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center dark:bg-indigo-600">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center dark:bg-gray-700">
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className="text-sm font-medium mb-1">
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </div>
                      <div className="text-sm leading-relaxed dark:text-gray-200">
                        {formatMessageContent(message.content)}
                      </div>
                      {message.timestamp && (
                        <div className="flex items-center justify-end mt-2 text-xs text-gray-500 dark:text-gray-400 space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Loading indicator with animation */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg rounded-bl-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Response Time Display with animation */}
      {showTime && responseTime !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="p-3 bg-indigo-50 dark:bg-indigo-900/30 border-t border-indigo-100"
        >
          <div className="flex items-center justify-center space-x-2 text-sm text-indigo-700 dark:text-indigo-300">
            <Clock className="w-4 h-4" />
            <span>Response time: {(responseTime / 1000).toFixed(2)} s</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}