# GrammarNoJutsu

A modern desktop application built with Tauri, React, and TypeScript that helps you process text using AI language models. Configure custom tasks and leverage multiple AI providers to transform, improve, or analyze your text content.

## Features

- **🎯 Custom Task Management**: Create and manage custom AI tasks with specific descriptions and behaviors
- **🤖 Multi-AI Provider Support**: Configure multiple AI providers (OpenAI, etc.) with secure local API key storage
- **⚡ Real-time Processing**: Process text input through AI models with instant results
- **🎨 Modern UI**: Clean, dark-themed interface built with shadcn/ui and TailwindCSS
- **🔒 Secure**: API keys stored locally using system keyring (macOS Keychain, Windows Credential Manager, Linux Secret Service)
- **📋 Workflow Tools**: Copy output, use output as new input, and clear functions for efficient workflows

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS 4** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

### Backend
- **Tauri 2** - Desktop application framework
- **Rust** - Backend logic and system integration
- **keyring** - Secure credential storage

## Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** - Package manager
- **Rust** (latest stable) - Required for Tauri
- **System dependencies** for Tauri development:
  - macOS: Xcode Command Line Tools
  - Windows: Microsoft Visual Studio C++ Build Tools
  - Linux: See [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

## Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/justintphan/GrammarNoJutsu.git](https://github.com/justintphan/GrammarNoJutsu.git)
   cd GrammarNoJutsu
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run in development mode**
   ```bash
   pnpm tauri dev
   ```

## Building for Production

```bash
pnpm tauri build
```

The built application will be available in `src-tauri/target/release/bundle/`

## Usage

### 1. Configure AI Providers

- Click **Settings** → **Manage AI**
- Select an AI provider (e.g., OpenAI)
- Enter your API key (click "Get API Key" for provider links)
- Enable the provider
- Click **Save Settings**

### 2. Create Tasks

- Click **Settings** → **Manage Task**
- Click **Add Task**
- Enter a task name and description
- The task description defines how the AI should process your text
- Click **Save All**

### 3. Process Text

- Select a task from the dropdown
- Select an AI model from the model selector
- Enter or paste your text in the input area
- Click the task button to process
- View results in the output area
- Use **Copy** to copy results or **Use as Input** to refine further

## Project Structure

```
language-assistant/
├── src/                      # React frontend
│   ├── components/          # UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── ManageTask.tsx  # Task management dialog
│   │   ├── ManageAI.tsx    # AI provider settings
│   │   └── AppSettings.tsx # Settings dropdown
│   ├── contexts/           # React contexts
│   │   ├── TaskContext/    # Task state management
│   │   └── AiProviderContext/ # AI provider state
│   ├── hooks/              # Custom React hooks
│   ├── screens/            # Main application screens
│   └── App.tsx             # Root component
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── ai/            # AI provider integrations
│   │   ├── commands.rs    # Tauri commands
│   │   └── lib.rs         # Main library
│   └── Cargo.toml         # Rust dependencies
└── package.json           # Node dependencies
```

## Available Scripts

- `pnpm dev` - Start Vite dev server
- `pnpm tauri dev` - Run Tauri app in development mode
- `pnpm build` - Build frontend
- `pnpm tauri build` - Build production application
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Security

- API keys are stored securely in your system's credential manager
- Keys are only transmitted to the respective AI provider's API
- No data is sent to third parties except the selected AI provider

## Development

### Adding a New AI Provider

1. Add provider configuration in `src/contexts/AiProviderContext/`
2. Implement API integration in `src-tauri/src/ai/`
3. Update the provider list in the context

### Adding shadcn/ui Components

```bash
pnpm dlx shadcn@latest add <component-name>
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
