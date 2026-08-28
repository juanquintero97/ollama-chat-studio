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
  Bot,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Lightbulb,
  Briefcase,
  Pencil,
  Check,
} from 'lucide-react';

export interface SystemPromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category:
    | 'engineering'
    | 'review'
    | 'education'
    | 'creative'
    | 'business'
    | 'custom';
  icon?: 'shield' | 'edu' | 'light' | 'briefcase' | 'custom';
  isBuiltIn?: boolean;
  createdAt: number;
}

const BUILT_IN_SYSTEM_TEMPLATES: SystemPromptTemplate[] = [
  {
    id: 'builtin-system-engineer',
    name: 'Software Engineer',
    description: 'Default engineering-focused assistant for code generation',
    category: 'engineering',
    icon: 'shield',
    isBuiltIn: true,
    createdAt: 0,
    content: `You are an expert software engineer. When writing or reviewing code: Prioritize correctness, readability, maintainability, and simplicity. Follow established software engineering best practices. Prefer efficient solutions without unnecessary complexity. Consider edge cases and potential failure modes. Do not invent APIs, libraries, or facts. If uncertain, state the uncertainty. Provide concise explanations of important technical decisions. When requirements are ambiguous, state your assumptions before proceeding. Return production-ready code unless explicitly asked for a prototype. Follow the user's requested output format exactly. Do not add explanations, comments, Markdown fences, or additional text unless explicitly requested.`,
  },
  {
    id: 'builtin-system-code-reviewer',
    name: 'Code Reviewer',
    description: 'Strict reviewer focused on quality, security, and best practices',
    category: 'review',
    icon: 'shield',
    isBuiltIn: true,
    createdAt: 0,
    content: `You are a senior code reviewer with 15+ years of experience. Your role is to provide thorough, constructive code reviews.

Focus areas:
- Correctness and potential bugs
- Security vulnerabilities (OWASP top 10)
- Performance and scalability
- Code readability and maintainability
- Adherence to language-specific idioms and best practices
- Test coverage gaps
- Documentation quality

For each issue you identify:
1. Describe the problem clearly
2. Explain why it matters
3. Provide a specific suggestion or fix
4. Reference relevant best practices when applicable

Be direct but constructive. Acknowledge good patterns. Prioritize critical issues over nitpicks.`,
  },
  {
    id: 'builtin-system-educator',
    name: 'Patient Educator',
    description: 'Explains concepts clearly with examples, beginner-friendly',
    category: 'education',
    icon: 'edu',
    isBuiltIn: true,
    createdAt: 0,
    content: `You are a patient, encouraging educator. Your goal is to help the user deeply understand concepts, not just receive answers.

Approach:
- Start with the high-level concept before diving into details
- Use analogies and real-world examples when helpful
- Break complex topics into digestible steps
- Use progressive disclosure — give simple answers first, then elaborate when asked
- Encourage questions and curiosity
- Celebrate progress and effort
- Avoid jargon; explain technical terms when first introduced
- Use code examples liberally with clear comments
- When the user is stuck, ask guiding questions rather than giving the full answer immediately

Tailor your depth and language to the user's apparent skill level. If uncertain, ask.`,
  },
  {
    id: 'builtin-system-architect',
    name: 'System Architect',
    description: 'High-level design, architecture, and trade-off analysis',
    category: 'engineering',
    icon: 'briefcase',
    isBuiltIn: true,
    createdAt: 0,
    content: `You are a seasoned system architect specializing in scalable, maintainable software systems.

When responding:
- Consider the problem at multiple levels: business goals, system architecture, data model, and implementation
- Discuss trade-offs explicitly (performance vs. simplicity, consistency vs. availability, etc.)
- Recommend patterns and approaches with clear justification
- Identify non-functional requirements (scalability, reliability, observability)
- Think about failure modes and edge cases
- Propose concrete, actionable designs with diagrams (ASCII or Mermaid) when helpful
- Reference industry best practices and case studies when relevant
- Ask clarifying questions about scale, constraints, and team capabilities before designing`,
  },
  {
    id: 'builtin-system-debugger',
    name: 'Debugging Assistant',
    description: 'Systematic, hypothesis-driven bug investigation',
    category: 'engineering',
    icon: 'light',
    isBuiltIn: true,
    createdAt: 0,
    content: `You are a methodical debugging assistant. Your approach is hypothesis-driven and systematic.

When helping debug:
1. Gather information first: ask about symptoms, error messages, expected vs. actual behavior, recent changes
2. Form explicit hypotheses ranked by likelihood
3. Suggest concrete diagnostic steps to test each hypothesis (logs, breakpoints, repro steps)
4. Once the root cause is identified, explain the mechanism clearly
5. Propose a minimal fix
6. Discuss how to prevent similar bugs (tests, type system, linting, etc.)

Bias toward the simplest explanation (Occam's razor). Question assumptions. Distinguish symptoms from causes. Prefer reading code over guessing.`,
  },
  {
    id: 'builtin-system-concise',
    name: 'Concise Assistant',
    description: 'Brief, to-the-point responses without unnecessary explanation',
    category: 'business',
    icon: 'briefcase',
    isBuiltIn: true,
    createdAt: 0,
    content: `Be extremely concise. Answer in the fewest words possible while remaining correct and complete.

Rules:
- No preamble, no postamble
- No "Sure!" or "Here's..." or "Let me explain..."
- Skip pleasantries and meta-commentary
- Use code blocks for code
- Use bullet points for lists
- One-line answers when possible
- Only elaborate if the user asks a follow-up

Respect the user's time. Get to the point.`,
  },
  {
    id: 'builtin-system-writer',
    name: 'Technical Writer',
    description: 'Clear, polished prose for documentation and explanations',
    category: 'creative',
    icon: 'edu',
    isBuiltIn: true,
    createdAt: 0,
    content: `You are an experienced technical writer. Your writing is clear, concise, and audience-aware.

Principles:
- Lead with the most important information (inverted pyramid)
- Use active voice and present tense
- Prefer simple words over jargon
- Break content into scannable sections with descriptive headings
- Use examples to illustrate abstract concepts
- Maintain consistent terminology throughout
- Define acronyms on first use
- Include code samples with clear context
- Write for the reader's goal, not your expertise

When given a topic, first consider: who is the audience, what do they need to know, and what action should they take after reading?`,
  },
];

const ICON_MAP = {
  shield: ShieldCheck,
  edu: GraduationCap,
  light: Lightbulb,
  briefcase: Briefcase,
  custom: Bot,
};

interface SystemPromptTemplatesProps {
  currentPrompt: string;
  onSelectTemplate: (content: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SystemPromptTemplates({
  currentPrompt,
  onSelectTemplate,
  open,
  onOpenChange,
}: SystemPromptTemplatesProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    setInternalIsOpen(val);
  };

  const [templates, setTemplates] = useState<SystemPromptTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] =
    useState<SystemPromptTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [recentlyApplied, setRecentlyApplied] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('ollama_system_prompt_templates');
    if (stored) {
      try {
        const parsed: SystemPromptTemplate[] = JSON.parse(stored);
        const customOnly = parsed.filter((t) => !t.isBuiltIn);
        setTemplates([...BUILT_IN_SYSTEM_TEMPLATES, ...customOnly]);
      } catch {
        setTemplates(BUILT_IN_SYSTEM_TEMPLATES);
      }
    } else {
      setTemplates(BUILT_IN_SYSTEM_TEMPLATES);
    }
  }, []);

  const saveTemplates = (newTemplates: SystemPromptTemplate[]) => {
    const customOnly = newTemplates.filter((t) => !t.isBuiltIn);
    localStorage.setItem(
      'ollama_system_prompt_templates',
      JSON.stringify(customOnly)
    );
    setTemplates(newTemplates);
  };

  const handleSelect = (template: SystemPromptTemplate) => {
    onSelectTemplate(template.content);
    setRecentlyApplied(template.id);
    setTimeout(() => setRecentlyApplied(null), 1500);
  };

  const handleCreate = () => {
    setEditingTemplate({
      id: `custom-system-${Date.now()}`,
      name: 'New System Prompt',
      description: 'A custom system prompt',
      content: currentPrompt,
      category: 'custom',
      icon: 'custom',
      isBuiltIn: false,
      createdAt: Date.now(),
    });
    setIsCreating(true);
  };

  const handleEdit = (template: SystemPromptTemplate) => {
    setEditingTemplate({ ...template });
    setIsCreating(false);
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    const exists = templates.find((t) => t.id === editingTemplate.id);
    let updated: SystemPromptTemplate[];
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
    if (!confirm('Delete this system prompt template?')) return;
    const updated = templates.filter((t) => t.id !== id);
    saveTemplates(updated);
  };

  const handleDuplicate = (template: SystemPromptTemplate) => {
    const copy: SystemPromptTemplate = {
      ...template,
      id: `custom-system-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isBuiltIn: false,
      createdAt: Date.now(),
    };
    saveTemplates([...templates, copy]);
  };

  const handleSaveCurrent = () => {
    setEditingTemplate({
      id: `custom-system-${Date.now()}`,
      name: 'My Custom System Prompt',
      description: 'Saved from current system prompt',
      content: currentPrompt,
      category: 'custom',
      icon: 'custom',
      isBuiltIn: false,
      createdAt: Date.now(),
    });
    setIsCreating(true);
  };

  const groupedTemplates = templates.reduce(
    (acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    },
    {} as Record<string, SystemPromptTemplate[]>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!open && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Bot className="w-4 h-4 mr-2" />
            System Prompts
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
                  <Bot className="w-5 h-5 text-blue-600" />
                  System Prompt Templates
                </DialogTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveCurrent}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Save Current
                  </Button>
                  <Button onClick={handleCreate} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </div>
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
                          ICON_MAP[template.icon || 'custom'] || Bot;
                        const isCurrent = currentPrompt === template.content;
                        return (
                          <div
                            key={template.id}
                            className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all cursor-pointer"
                            onClick={() => handleSelect(template)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
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
                                  {isCurrent && (
                                    <Badge
                                      variant="default"
                                      className="text-[10px] h-4 bg-green-600"
                                    >
                                      Active
                                    </Badge>
                                  )}
                                  {recentlyApplied === template.id && (
                                    <Badge
                                      variant="default"
                                      className="text-[10px] h-4 bg-blue-600"
                                    >
                                      <Check className="w-2.5 h-2.5 mr-0.5" />
                                      Applied
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                  {template.description}
                                </p>
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

            <div className="border-t px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Click any template to apply it as the current system prompt
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface TemplateEditorProps {
  template: SystemPromptTemplate;
  isNew: boolean;
  onChange: (template: SystemPromptTemplate) => void;
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
          <Bot className="w-5 h-5" />
          {isNew ? 'Create System Prompt' : 'Edit System Prompt'}
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
            placeholder="System prompt name"
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
          <div className="flex flex-wrap gap-2">
            {(
              [
                'engineering',
                'review',
                'education',
                'creative',
                'business',
                'custom',
              ] as const
            ).map((c) => (
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
          <label className="text-sm font-medium block mb-1">
            System Prompt Content
          </label>
          <Textarea
            value={template.content}
            onChange={(e) =>
              onChange({ ...template, content: e.target.value })
            }
            placeholder="Define the AI's role, behavior, and constraints..."
            rows={14}
            className="font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
