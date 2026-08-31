import { render, screen } from '@testing-library/react';
import { DarkModeToggle } from '../components/DarkModeToggle';

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<DarkModeToggle />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});