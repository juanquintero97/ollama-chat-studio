import { render, screen } from '@testing-library/react';
import { ModelComparison } from '../components/ModelComparison';

describe('ModelComparison', () => {
  const mockProps = {
    models: ['phi:2.7b', 'codegemma:2b'],
    defaultModel: 'phi:2.7b',
    systemPrompt: 'You are a helpful assistant.',
    temperature: 0.2,
    numPredict: 1024,
    numCtx: 8192,
  };

  it('renders the trigger button', () => {
    render(<ModelComparison {...mockProps} />);
    
    const buttons = screen.getAllByText(/Compare Models/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders without crashing', () => {
    const { container } = render(<ModelComparison {...mockProps} />);
    expect(container).toBeInTheDocument();
  });
});