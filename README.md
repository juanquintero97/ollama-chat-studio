# Ollama Chat Studio

A clean, minimal React chat application for interacting with the Ollama localhost API.

## Features

- **Model Selection**: Dropdown populated from installed Ollama models
- **Prompt Input**: Full-featured textarea for entering prompts
- **Streaming Support**: View responses character-by-character as they're generated
- **Think Animation**: Visual indicator when the model is "thinking"
- **Temperature Control**: Slider (0–1) for controlling randomness
- **Token Limit**: Configurable `num_predict` with presets (512, 1024, 2048, 4096)
- **Context Window**: Configurable `num_ctx` with presets (4096, 8192)
- **System Prompt Editor**: Full editor to customize the system prompt for code generation
- **Response Time**: Shows elapsed time for each request
- **Code Formatting**: Automatic detection and syntax highlighting for code blocks
- **Copy to Clipboard**: One-click copy button for code snippets

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm/yarn
- **Ollama** installed and running locally
- At least one language model installed (e.g., `codegemma:2b`, `phi:2.7b`)

## Setup Instructions

### 1. Install Ollama (if not already installed)

Visit [ollama.ai](https://ollama.ai) and follow the installation instructions for your platform.

### 2. Start Ollama and Pull a Model

```bash
# Start Ollama service (if not running)
ollama serve

# Pull a model (example - codegemma for code generation)
ollama pull codegemma:2b
```

### 3. Clone the Project

```bash
git clone <repository-url>
cd ollama-chat-studio
```

### 4. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
# or
bun install
```

### 5. Configure the Application

The app connects to Ollama at `http://localhost:11434` by default. If your Ollama instance runs on a different host/port, you can:

1. Create a `.env` file in the project root
2. Add the following (if supported in future versions):
   ```env
   VITE_OLLAMA_HOST=your-host:port
   ```

### 6. Start the Development Server

```bash
pnpm run dev
# or
npm run dev
# or
yarn dev
# or
bun dev
```

Open http://localhost:5173 (or the URL shown in console) in your browser.

## Building for Production

```bash
pnpm run build
# or
npm run build
```

This creates a static build in the `dist/` directory, ready to be served.

## API Integration

The application communicates with Ollama's REST API:

- **Models**: `GET http://localhost:11434/v1/models`
- **Generate**: `POST http://localhost:11434/api/generate`

Request payload structure:

```json
{
  "model": "codegemma:2b",
  "system": "You are an expert software engineer. When writing or reviewing code: Prioritize correctness, readability, maintainability, and simplicity. Follow established software engineering best practices. Prefer efficient solutions without unnecessary complexity. Consider edge cases and potential failure modes. Do not invent APIs, libraries, or facts. If uncertain, state the uncertainty. Provide concise explanations of important technical decisions. When requirements are ambiguous, state your assumptions before proceeding. Return production-ready code unless explicitly asked for a prototype. Follow the user's requested output format exactly. Do not add explanations, comments, Markdown fences, or additional text unless explicitly requested.",
  "prompt": "Write a Python function called merge_intervals(intervals).\n\nGiven a list of intervals [start, end], merge all overlapping intervals.\n\nExample:\nInput: [[1,3],[2,6],[8,10],[9,12]]\nOutput: [[1,6],[8,12]]\n\nRequirements:\n- Handle an empty list.\n- Return intervals sorted by start.\n- Return only the code.",
  "stream": false,
  "think": false,
  "options": {
    "num_ctx": 8192,
    "temperature": 0.2,
    "num_predict": 1024
  }
}
```

## Project Structure

```
src/
├── components/
│   └── Chat.tsx          # Message display component
├── pages/
│   └── Index.tsx         # Main page with form and handlers
└── lib/
    (utilities, if any)

tailwind.config.ts        # Tailwind CSS configuration
vite.config.ts            # Vite bundler configuration
tsconfig.json             # TypeScript configuration
```

## Troubleshooting

### "Failed to fetch models" or empty dropdown

- Ensure Ollama is running: `ollama serve`
- Check that models are installed: `ollama list`
- Verify the API is accessible: `curl http://localhost:11434/v1/models`

### "Error: 404" or "Error: 500" when sending messages

- Verify the model name in the dropdown is correct
- Check model availability: `ollama list`
- Ensure the model is currently loaded or can be pulled

### Streaming not working

- Toggle the "Enable streaming response" checkbox
- Some older models may not support streaming

## License

MIT