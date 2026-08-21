import { useState, useEffect } from 'react';
import { MessageSquare, Clock, Trash2, Download, Upload, X } from 'lucide-react';
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

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
  updatedAt: number;
  model: string;
  temperature: number;
  numPredict: number;
  numCtx: number;
}

interface ChatHistoryProps {
  currentMessages: any[];
  currentSettings: {
    model: string;
    temperature: number;
    numPredict: number;
    numCtx: number;
  };
  onLoad: (session: ChatSession) => void;
  onClear: () => void;
}

export function ChatHistory({ currentMessages, currentSettings, onLoad, onClear }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load saved sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    try {
      const saved = localStorage.getItem('ollama_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSessions(parsed.sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt));
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const saveCurrentChat = () => {
    if (currentMessages.length === 0) {
      alert('No messages to save');
      return;
    }

    const title = currentMessages[0]?.content?.slice(0, 50) + '...' || 'Untitled Chat';
    const session: ChatSession = {
      id: Date.now().toString(),
      title,
      messages: currentMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: currentSettings.model,
      temperature: currentSettings.temperature,
      numPredict: currentSettings.numPredict,
      numCtx: currentSettings.numCtx,
    };

    const updated = [...sessions, session];
    setSessions(updated);
    localStorage.setItem('ollama_chat_sessions', JSON.stringify(updated));
    alert('Chat saved successfully!');
  };

  const loadSession = (session: ChatSession) => {
    onLoad(session);
    setIsOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('ollama_chat_sessions', JSON.stringify(updated));
  };

  const clearAllSessions = () => {
    if (confirm('Are you sure you want to delete all saved chats?')) {
      setSessions([]);
      localStorage.removeItem('ollama_chat_sessions');
    }
  };

  const exportChat = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-${session.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importChat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const session = JSON.parse(event.target?.result as string);
        const updated = [...sessions, session];
        setSessions(updated);
        localStorage.setItem('ollama_chat_sessions', JSON.stringify(updated));
        alert('Chat imported successfully!');
      } catch (error) {
        alert('Failed to import chat - invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat History
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button onClick={saveCurrentChat} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Save Current
              </Button>
              <label>
                <Button size="sm" variant="outline" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={importChat}
                      className="hidden"
                    />
                  </span>
                </Button>
              </label>
              <Button onClick={clearAllSessions} size="sm" variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[60vh] rounded-md border">
            <div className="p-4 space-y-3">
              {sessions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No saved chats yet</p>
                  <p className="text-sm">Save your current conversation to see it here</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadSession(session)}
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm truncate">{session.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {session.model}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            T:{session.temperature}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {session.numPredict} tokens
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Updated: {formatDate(session.updatedAt)}</span>
                          <span>•</span>
                          <span>{session.messages.length} messages</span>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => exportChat(session, e)}
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => deleteSession(session.id, e)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}