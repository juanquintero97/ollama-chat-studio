import { render, screen } from '@testing-library/react';
import { KeyboardShortcutsDialog, KeyboardShortcutsHelp } from '../components/KeyboardShortcuts';

describe('KeyboardShortcutsDialog', () => {
  const mockProps = {
    isOpen: false,
    onClose: () => {},
  };

  it('renders without crashing', () => {
    const { container } = render(<KeyboardShortcutsDialog {...mockProps} />);
    expect(container).toBeInTheDocument();
  });

  it('shows dialog when open', () => {
    render(<KeyboardShortcutsDialog isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('renders shortcut categories', () => {
    render(<KeyboardShortcutsDialog isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText(/Shortcuts/i)).toBeInTheDocument();
  });

  it('shows close button', () => {
    render(<KeyboardShortcutsDialog isOpen={true} onClose={() => {}} />);
    
    const button = screen.getByRole('button', { name: /close/i });
    expect(button).toBeInTheDocument();
  });
});

describe('KeyboardShortcutsHelp', () => {
  it('renders without crashing', () => {
    const { container } = render(<KeyboardShortcutsHelp />);
    expect(container).toBeInTheDocument();
  });

  it('renders keyboard shortcut hint', () => {
    render(<KeyboardShortcutsHelp />);
    
    expect(screen.getByText(/⌘K for shortcuts/i)).toBeInTheDocument();
  });
});