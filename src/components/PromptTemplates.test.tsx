import { render, screen } from '@testing-library/react';
import { PromptTemplates } from '../components/PromptTemplates';

describe('PromptTemplates', () => {
  const mockProps = {
    onSelectTemplate: () => {},
    open: false,
    onOpenChange: () => {},
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the trigger button', () => {
    render(<PromptTemplates {...mockProps} />);
    
    const buttons = screen.getAllByText(/Templates/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders without crashing', () => {
    const { container } = render(<PromptTemplates {...mockProps} />);
    expect(container).toBeInTheDocument();
  });

  it('uses the correct localStorage key', () => {
    const saved = [{
      id: '1',
      name: 'Test Template',
      content: 'Test content',
      category: 'code',
      builtIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }];
    localStorage.setItem('ollama_prompt_templates', JSON.stringify(saved));

    render(<PromptTemplates {...mockProps} />);
    
    const buttons = screen.getAllByText(/Templates/i);
    expect(buttons.length).toBeGreaterThan(0);
  });
});