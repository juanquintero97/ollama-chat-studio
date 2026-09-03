import { render, screen } from '@testing-library/react';
import { ChatSettings } from '../components/ChatSettings';

describe('ChatSettings', () => {
  const mockProps = {
    model: 'phi:2.7b',
    models: ['phi:2.7b', 'codegemma:2b'],
    temperature: 0.2,
    numCtx: 8192,
    numPredict: 1024,
    stream: false,
    think: false,
    systemPromptContent: 'You are a helpful assistant.',
    isEditingSystemPrompt: false,
    showSystemPrompts: false,
    showTemplates: false,
    showModelComparison: false,
    showCodeExecution: false,
    showHistoryDialog: false,
    prompt: '',
    loading: false,
    responseTime: null,
    showTime: false,
    onModelChange: () => {},
    onTemperatureChange: () => {},
    onNumCtxChange: () => {},
    onNumPredictChange: () => {},
    onStreamChange: () => {},
    onThinkChange: () => {},
    onSystemPromptContentChange: () => {},
    onIsEditingSystemPromptChange: () => {},
    onShowSystemPromptsChange: () => {},
    onShowTemplatesChange: () => {},
    onShowModelComparisonChange: () => {},
    onShowCodeExecutionChange: () => {},
    onShowHistoryDialogChange: () => {},
    onPromptChange: () => {},
    onSubmit: () => {},
    onClearMessages: () => {},
    onSaveChatSession: () => {},
    onLoadSession: () => {},
  };

  it('renders the settings panel with title', () => {
    render(<ChatSettings {...mockProps} />);
    
    expect(screen.getByText('Chat Settings')).toBeInTheDocument();
  });

  it('renders Model and Prompt labels', () => {
    render(<ChatSettings {...mockProps} />);
    
    expect(screen.getByText('Model')).toBeInTheDocument();
    expect(screen.getByText('Prompt')).toBeInTheDocument();
  });

  it('renders all model options in dropdown', () => {
    render(<ChatSettings {...mockProps} />);
    
    expect(screen.getByText('phi:2.7b')).toBeInTheDocument();
    expect(screen.getByText('codegemma:2b')).toBeInTheDocument();
  });

  it('shows Send button when not loading', () => {
    render(<ChatSettings {...mockProps} prompt="Hello" />);
    
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('shows Sending... when loading', () => {
    render(<ChatSettings {...mockProps} prompt="Hello" loading={true} />);
    
    expect(screen.getByText('Sending...')).toBeInTheDocument();
  });

  it('shows response time when showTime is true', () => {
    render(<ChatSettings {...mockProps} responseTime={2500} showTime={true} />);
    
    expect(screen.getByText('Response time: 2.50 s')).toBeInTheDocument();
  });

  it('renders stream checkbox', () => {
    render(<ChatSettings {...mockProps} />);
    
    expect(screen.getByText('Enable streaming response')).toBeInTheDocument();
  });

  it('renders think checkbox', () => {
    render(<ChatSettings {...mockProps} />);
    
    expect(screen.getByText('Enable thinking response')).toBeInTheDocument();
  });

  it('renders temperature slider', () => {
    render(<ChatSettings {...mockProps} />);
    
    expect(screen.getByText('Temperature')).toBeInTheDocument();
  });

  it('renders token options', () => {
    render(<ChatSettings {...mockProps} />);
    
    expect(screen.getByText('512 tokens')).toBeInTheDocument();
    expect(screen.getByText('1024 tokens')).toBeInTheDocument();
  });

  it('renders System Prompt section', () => {
    render(<ChatSettings {...mockProps} />);
    
    expect(screen.getByText('System Prompt')).toBeInTheDocument();
  });
});