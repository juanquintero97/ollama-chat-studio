import { useEffect, useRef } from 'react';
import { MessageSquare, User, Clock, Loader2, Copy } from 'lucide-react';

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

  // Parse and render markdown content with code blocks
  const formatMessageContent = (content: string) => {
    // Split content by code blocks (```...```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: { type: 'text' | 'code'; content: string; language?: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }
      // Add the code block
      parts.push({
        type: 'code',
        content: match[2],
        language: match[1] || 'text',
      });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    // If no code blocks found, treat entire content as text
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: content,
      });
    }

    return (
      <div className="whitespace-pre-wrap break-words">
        {parts.map((part, i) => {
          if (part.type === 'code') {
            return (
              <div key={i} className="my-2">
                <div className="relative group">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap break-words">
                    <code>{part.content}</code>
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(part.content)}
                    className="absolute top-2 right-2 p-1 bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>
            );
          }
          // Render text with line breaks
          return (
            <div key={i} className="whitespace-pre-wrap break-words">
              {part.content.split('\n').map((line, j) => (
                <span key={j}>
                  {line}
                  {j < part.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Chat Header - Fixed/Sticky */}
        <div className="sticky top-0 z-10 p-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
          </div>
        </div>
  
        {/* Messages Area - Scrollable */}
                <div className="flex-1 overflow-y-auto max-h-screen p-4 space-y-4 relative">
                  {/* Scroll indicator at top when scrolled */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none z-5" />
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-lg rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-lg rounded-bl-sm border border-gray-200'
                } p-4 shadow-sm transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-start space-x-2">
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {message.role === 'user' ? (
                      <div className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className="text-sm font-medium mb-1">
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    <div className="text-sm leading-relaxed">
                      {formatMessageContent(message.content)}
                    </div>
                    {message.timestamp && (
                      <div className="flex items-center justify-end mt-2 text-xs text-gray-500 space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-sm border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Response Time Display (in seconds) */}
      {showTime && responseTime !== null && (
        <div className="p-3 bg-indigo-50 border-t border-indigo-100">
          <div className="flex items-center justify-center space-x-2 text-sm text-indigo-700">
            <Clock className="w-4 h-4" />
            <span>Response time: {(responseTime / 1000).toFixed(2)} s</span>
          </div>
        </div>
      )}
    </div>
  );
}