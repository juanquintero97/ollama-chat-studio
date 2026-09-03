import { render, screen } from '@testing-library/react';
import { Chat } from '../components/Chat';

// Mock scrollIntoView before all tests in this file
global.HTMLElement.prototype.scrollIntoView = function() {};

describe('Chat', () => {
  const mockMessages = [
    { role: 'user' as const, content: 'Hello', timestamp: new Date('2024-01-01T12:00:00') },
    { role: 'assistant' as const, content: 'Hi there!', timestamp: new Date('2024-01-01T12:00:05') },
  ];

  it('renders messages correctly', () => {
    render(<Chat messages={mockMessages} loading={false} responseTime={null} showTime={false} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('shows user and assistant labels', () => {
    render(<Chat messages={mockMessages} loading={false} responseTime={null} showTime={false} />);
    
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Assistant')).toBeInTheDocument();
  });

  it('shows loading indicator when loading is true', () => {
    render(<Chat messages={[]} loading={true} responseTime={null} showTime={false} />);
    
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    render(<Chat messages={[]} loading={false} responseTime={null} showTime={false} />);
    
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });

  it('displays response time when showTime is true', () => {
    render(<Chat messages={mockMessages} loading={false} responseTime={1500} showTime={true} />);
    
    expect(screen.getByText('Response time: 1.50 s')).toBeInTheDocument();
  });
});