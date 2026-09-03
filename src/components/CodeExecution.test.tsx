import { render, screen } from '@testing-library/react';
import { CodeExecution } from '../components/CodeExecution';

describe('CodeExecution', () => {
  const mockProps = {
    open: false,
    onOpenChange: () => {},
  };

  it('renders the trigger button', () => {
    render(<CodeExecution {...mockProps} />);
    
    const buttons = screen.getAllByText(/Code Execution/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders without crashing', () => {
    const { container } = render(<CodeExecution {...mockProps} />);
    expect(container).toBeInTheDocument();
  });

  it('handles open state', () => {
    const onOpenChange = vi.fn();
    render(<CodeExecution open={true} onOpenChange={onOpenChange} />);
    
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});