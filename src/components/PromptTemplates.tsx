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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Code2,
  TestTube2,
  Wand2,
  BookOpen,
  Pencil,
} from 'lucide-react';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'code' | 'writing' | 'analysis' | 'custom';
  icon?: 'code' | 'test' | 'wand' | 'book' | 'custom';
  isBuiltIn?: boolean;
  createdAt: number;
}

const BUILT_IN_TEMPLATES: PromptTemplate[] = [
  {
    id: 'builtin-code-review',
    name: 'Code Review',
    description: 'Review code for bugs, style, and best practices',
    category: 'code',
    icon: 'code',
    isBuiltIn: true,
    createdAt: 0,
    content: `Please review the following code for:
1. Correctness and potential bugs
2. Performance and efficiency
3. Readability and maintainability
4. Security vulnerabilities
5. Adherence to best practices

Code to review:
\`\`\`
[PASTE CODE HERE]
\`\`\`

Provide specific suggestions with line numbers where applicable.`,
  },
  {
    id: 'builtin-refactor',
    name: 'Refactor',
    description: 'Refactor code for better readability and performance',
    category: 'code',
    icon: 'wand',
    isBuiltIn: true,
    createdAt: 0,
    content: `Refactor the following code to improve:
- Readability and clarity
- Performance
- Maintainability
- Test coverage (if applicable)

Keep the same functionality but apply best practices and modern patterns.

Code to refactor:
\`\`\`
[PASTE CODE HERE]
\`\`\`

Return the refactored code with brief explanations of changes.`,
  },
  {
    id: 'builtin-explain',
    name: 'Explain Code',
    description: 'Explain what code does in plain language',
    category: 'analysis',
    icon: 'book',
    isBuiltIn: true,
    createdAt: 0,
    content: `Explain the following code in detail:

\`\`\`
[PASTE CODE HERE]
\`\`\`

Please cover:
1. What the code does (high-level purpose)
2. Step-by-step breakdown
3. Key concepts and patterns used
4. Any potential issues or edge cases
5. Example usage if appropriate

Use clear, beginner-friendly language.`,
  },
  {
    id: 'builtin-tests',
    name: 'Write Tests',
    description: 'Generate unit tests for the given code',
    category: 'code',
    icon: 'test',
    isBuiltIn: true,
    createdAt: 0,
    content: `Write comprehensive unit tests for the following code:

\`\`\`
[PASTE CODE HERE]
\`\`\`

Include:
1. Happy path tests
2. Edge cases (empty input, null, boundary values)
3. Error cases and exception handling
4. Mock/stub any external dependencies

Use the appropriate testing framework for the language. Provide runnable code with descriptive test names.`,
  },
  {
    id: 'builtin-bug-fix',
    name: 'Fix Bug',
    description: 'Analyze and fix a bug in the code',
    category: 'code',
    icon: 'wand',
    isBuiltIn: true,
    createdAt: 0,
    content: `I'm encountering a bug in the following code:

\`\`\`
[PASTE CODE HERE]
\`\`\`

Expected behavior: [DESCRIBE]
Actual behavior: [DESCRIBE]
Error message (if any): [ERROR]

Please:
1. Identify the root cause
2. Explain why it's happening
3. Provide a fixed version
4. Suggest how to prevent similar bugs in the future`,
  },
  {
    id: 'builtin-document',
    name: 'Add Documentation',
    description: 'Generate documentation for code',
    category: 'writing',
    icon: 'book',
    isBuiltIn: true,
    createdAt: 0,
    content: `Generate comprehensive documentation for the following code:

\`\`\`
[PASTE CODE HERE]
\`\`\`

Include:
1. Function/class purpose and overview
2. Parameters and return values
3. Usage examples
4. Edge cases and error handling
5. Notes on complexity (time/space) where relevant

Use the standard docstring/comment format for the language.`,
  },
];

const ICON_MAP = {
  code: Code2,
  test: TestTube2,
  wand: Wand2,
  book: BookOpen,
  custom: FileText,
};

interface PromptTemplatesProps {
  onSelectTemplate: (content: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PromptTemplates({
  onSelectTemplate,
  open,
  onOpenChange,
}: PromptTemplatesProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    setInternalIsOpen(val);
  };

  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);

  // Load templates on mount
  useEffect(() => {
    const stored = localStorage.getItem('ollama_prompt_templates');
    if (stored) {
      try {
        const parsed: PromptTemplate[] = JSON.parse(stored);
        // Merge with built-in templates to ensure they always exist
        const customOnly = parsed.filter((t) => !t.isBuiltIn);
        setTemplates([...BUILT_IN_TEMPLATES, ...customOnly]);
      } catch {
        setTemplates(BUILT_IN_TEMPLATES);
      }
    } else {
      setTemplates(BUILT_IN_TEMPLATES);
    }
  }, []);

  const saveTemplates = (newTemplates: PromptTemplate[]) => {
    const customOnly = newTemplates.filter((t) => !t.isBuiltIn);
    localStorage.setItem('ollama_prompt_templates', JSON.stringify(customOnly));
    setTemplates(newTemplates);
  };

  const handleSelect = (template: PromptTemplate) => {
    onSelectTemplate(template.content);
    setIsOpen(false);
  };

  const handleCreate = () => {
    setEditingTemplate({
      id: `custom-${Date.now()}`,
      name: 'New Template',
      description: 'A custom prompt template',
      content: '',
      category: 'custom',
      icon: 'custom',
      isBuiltIn: false,
      createdAt: Date.now(),
    });
    setIsCreating(true);
  };

  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate({ ...template });
    setIsCreating(false);
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    const exists = templates.find((t) => t.id === editingTemplate.id);
    let updated: PromptTemplate[];
    if (exists) {
      updated = templates.map((t) =>
        t.id === editingTemplate.id ? editingTemplate : t
      );
    } else {
      updated = [...templates, editingTemplate];
    }
    saveTemplates(updated);
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this template?')) return;
    const updated = templates.filter((t) => t.id !== id);
    saveTemplates(updated);
  };

  const handleDuplicate = (template: PromptTemplate) => {
    const copy: PromptTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isBuiltIn: false,
      createdAt: Date.now(),
    };
    saveTemplates([...templates, copy]);
  };

  const groupedTemplates = templates.reduce(
    (acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    },
    {} as Record<string, PromptTemplate[]>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {!open && (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-3xl max-h-[85vh] p-0">
          {editingTemplate ? (
            <TemplateEditor
              template={editingTemplate}
              isNew={isCreating}
              onChange={setEditingTemplate}
              onSave={handleSave}
              onCancel={() => {
                setEditingTemplate(null);
                setIsCreating(false);
              }}
            />
          ) : (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Prompt Templates
                  </DialogTitle>
                  <Button onClick={handleCreate} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                  </Button>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh]">
                <div className="p-6 space-y-6">
                  {Object.entries(groupedTemplates).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 capitalize">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {items.map((template) => {
                          const Icon =
                            ICON_MAP[template.icon || 'custom'] || FileText;
                          return (
                            <div
                              key={template.id}
                              className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all cursor-pointer"
                              onClick={() => handleSelect(template)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                        {template.name}
                                      </h4>
                                      {template.isBuiltIn && (
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px] h-4"
                                        >
                                          Built-in
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                      {template.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!template.isBuiltIn && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(template);
                                    }}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicate(template);
                                  }}
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                                {!template.isBuiltIn && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-red-500 hover:text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(template.id);
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface TemplateEditorProps {
  template: PromptTemplate;
  isNew: boolean;
  onChange: (template: PromptTemplate) => void;
  onSave: () => void;
  onCancel: () => void;
}

function TemplateEditor({
  template,
  isNew,
  onChange,
  onSave,
  onCancel,
}: TemplateEditorProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {isNew ? 'Create Template' : 'Edit Template'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSave}>
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Name</label>
          <Input
            value={template.name}
            onChange={(e) => onChange({ ...template, name: e.target.value })}
            placeholder="Template name"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Description</label>
          <Input
            value={template.description}
            onChange={(e) =>
              onChange({ ...template, description: e.target.value })
            }
            placeholder="Short description"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Category</label>
          <div className="flex gap-2">
            {(['code', 'writing', 'analysis', 'custom'] as const).map((c) => (
              <Button
                key={c}
                variant={template.category === c ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ ...template, category: c })}
                className="capitalize"
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Prompt Content</label>
          <Textarea
            value={template.content}
            onChange={(e) =>
              onChange({ ...template, content: e.target.value })
            }
            placeholder="Write your prompt template here. Use [BRACKETS] for placeholders."
            rows={12}
            className="font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
