import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

export const SHORTCUTS: Shortcut[] = [
  {
    keys: ['⌘', '↵'],
    description: 'Send the current prompt',
    category: 'Chat',
  },
  {
    keys: ['⌘', 'K'],
    description: 'Open command palette',
    category: 'Navigation',
  },
  {
    keys: ['⌘', '/'],
    description: 'Focus the prompt textarea',
    category: 'Navigation',
  },
  {
    keys: ['Esc'],
    description: 'Clear focus / conversation',
    category: 'Chat',
  },
  {
    keys: ['⌘', 'D'],
    description: 'Toggle dark mode',
    category: 'Appearance',
  },
  {
    keys: ['⌘', '⇧', 'H'],
    description: 'Open chat history',
    category: 'Navigation',
  },
];

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category)));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[50vh] rounded-md border">
          <div className="p-4 space-y-6">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {SHORTCUTS.filter(s => s.category === category).map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {shortcut.description}
                      </span>
                      <div className="flex space-x-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <Badge
                            key={keyIndex}
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">K</kbd> to toggle
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function KeyboardShortcutsHelp() {
  return (
    <div className="fixed bottom-4 right-4">
      <div className="text-xs text-gray-400 dark:text-gray-500 mb-1 text-center">
        ⌘K for shortcuts
      </div>
    </div>
  );
}
