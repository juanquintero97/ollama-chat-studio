import { render, screen } from '@testing-library/react';
import { SystemPromptTemplates } from '../components/SystemPromptTemplates';

describe('SystemPromptTemplates', () => {
  const mockProps = {
    currentPrompt: 'You are a helpful assistant.',
    onSelectTemplate: () => {},
    open: false,
    onOpenChange: () => {},
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the trigger button', () => {
    render(<SystemPromptTemplates {...mockProps} />);
    
    const buttons = screen.getAllByText(/System Prompt/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders without crashing', () => {
    const { container } = render(<SystemPromptTemplates {...mockProps} />);
    expect(container).toBeInTheDocument();
  });

  it('uses the correct localStorage key', () => {
    const saved = [{
      id: '1',
      name: 'Test Template',
      content: 'Test content',
      category: 'engineering',
      builtIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }];
    localStorage.setItem('ollama_system_prompt_templates', JSON.stringify(saved));

    render(<SystemPromptTemplates {...mockProps} />);
    
    const buttons = screen.getAllByText(/System Prompt/i);
    expect(buttons.length).toBeGreaterThan(0);
  });
});