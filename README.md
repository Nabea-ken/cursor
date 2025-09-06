# Cursor Clone - AI-Powered Code Editor

A desktop application similar to Cursor, built with Electron and Monaco Editor, featuring AI-powered code completion, chat assistance, and code refactoring capabilities.

## 🚀 Features

### Core Editor Features
- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting
- **Multi-language Support**: JavaScript, TypeScript, Python, HTML, CSS, JSON, and more
- **File Operations**: Open, save, and create new files
- **Modern UI**: Dark theme with VS Code-like interface
- **Keyboard Shortcuts**: Standard editor shortcuts (Ctrl+N, Ctrl+O, Ctrl+S, etc.)

### AI-Powered Features
- **Inline Code Completion**: AI-powered ghost text suggestions as you type
- **AI Chat Assistant**: Natural language questions about your code
- **Code Refactoring**: Right-click to refactor selected code
- **Code Explanation**: Get detailed explanations of selected code
- **Context-Aware**: Send selected code or entire files as context to AI
- **Multiple AI Providers**: Support for OpenAI, HuggingFace, and Ollama
- **AI Service Manager**: Unified interface for different AI providers
- **Advanced AI Features**: Code generation, debugging assistance, test generation

### User Experience
- **Responsive Design**: Works on different screen sizes
- **Context Menu**: Right-click for AI actions and standard editor operations
- **Status Bar**: Shows cursor position, file language, and AI status
- **Loading States**: Visual feedback during AI operations
- **Error Handling**: Graceful error handling with user-friendly messages

### Advanced Services
- **Git Integration**: Full Git operations with commit history and branching
- **Terminal Service**: Integrated terminal for command execution
- **Code Snippets**: Manage and organize reusable code snippets
- **Analytics Service**: Track usage patterns and performance metrics
- **Collaboration Service**: Real-time collaboration with team members
- **Database Service**: Persistent storage for preferences and data
- **Debug Service**: Advanced debugging and error analysis

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (for AI features)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cursor-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

4. **Set up OpenAI API Key**
   - Click the key icon in the toolbar or press `Ctrl+K`
   - Enter your OpenAI API key
   - The AI features will be enabled once the key is set

### Development Mode
```bash
npm run dev
```
This will start the app with DevTools open for debugging.

## 📁 Project Structure

```
cursor-clone/
├── main.js                 # Electron main process
├── preload.js             # Secure IPC bridge
├── package.json           # Dependencies and scripts
├── services/
│   ├── ai-service.js      # OpenAI AI service implementation
│   ├── ai-manager.js      # AI service manager
│   ├── huggingface-service.js # HuggingFace AI service
│   ├── ollama-service.js  # Ollama local AI service
│   ├── git-service.js     # Git integration service
│   ├── terminal-service.js # Terminal service
│   ├── snippets-service.js # Code snippets service
│   ├── analytics-service.js # Analytics and insights
│   ├── collaboration-service.js # Real-time collaboration
│   ├── database-service.js # Database and persistence
│   └── debug-service.js   # Debugging assistance
├── renderer/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Application styles
│   └── app.js            # Frontend application logic
├── docs/                  # Documentation
└── README.md             # This file
```

## 🔧 Configuration

### AI Service Configuration
The AI service is configured in `services/ai-service.js`:

- **Default Model**: `gpt-4o-mini` (can be changed to other OpenAI models)
- **Max Tokens**: 1000 (adjustable for different response lengths)
- **Temperature**: 0.3 (controls creativity vs consistency)

### Editor Configuration
Monaco Editor settings can be modified in `renderer/app.js`:

- **Theme**: Custom dark theme matching VS Code
- **Font Size**: 14px (adjustable)
- **Minimap**: Enabled by default
- **Word Wrap**: Enabled

## 🎯 Usage Guide

### Basic Operations
1. **New File**: `Ctrl+N` or click the file icon
2. **Open File**: `Ctrl+O` or click the folder icon
3. **Save File**: `Ctrl+S` or click the save icon
4. **Toggle Chat**: `Ctrl+L` or click the chat icon

### AI Features
1. **Set API Key**: `Ctrl+K` or click the key icon
2. **Chat with AI**: Open chat panel and type questions
3. **Send Code Context**: Use "Send Selected" or "Send File" buttons
4. **Refactor Code**: Select code, right-click, choose "Refactor Code"
5. **Explain Code**: Select code, right-click, choose "Explain Code"

### Keyboard Shortcuts
- `Ctrl+N`: New file
- `Ctrl+O`: Open file
- `Ctrl+S`: Save file
- `Ctrl+Shift+S`: Save as
- `Ctrl+K`: Set API key
- `Ctrl+L`: Toggle chat panel
- `Ctrl+Q`: Quit application

## 🔌 Extending the Application

### Adding New AI Providers
The AI service is designed to be easily extensible. To add a new provider:

1. Create a new service class in `services/`
2. Implement the required methods:
   - `getInlineCompletion()`
   - `chat()`
   - `refactorCode()`
   - `explainCode()`

3. Update the main process to use the new service

### Adding New Editor Features
1. **Language Support**: Add new file extensions to the language mapping in `app.js`
2. **Themes**: Create new Monaco themes in `app.js`
3. **Shortcuts**: Add new keyboard shortcuts in the event handler

### Adding New UI Components
1. Add HTML structure in `index.html`
2. Add styles in `styles.css`
3. Add JavaScript logic in `app.js`

## 🚧 Development Roadmap

### Phase 1 (Current) - MVP ✅
- [x] Monaco Editor integration
- [x] Basic file operations
- [x] OpenAI API integration
- [x] Inline completions
- [x] AI chat panel
- [x] Code refactoring and explanation
- [x] Context menu
- [x] Keyboard shortcuts

### Phase 2 - Enhanced Features ✅
- [x] Multiple AI model support (OpenAI, HuggingFace, Ollama)
- [x] Git integration service
- [x] Terminal service
- [x] Code snippets service
- [x] Analytics service
- [x] Collaboration service
- [x] Database service
- [x] Debug service
- [ ] File explorer panel (UI integration needed)
- [ ] Multi-file context retrieval (UI integration needed)
- [ ] Search and replace (UI integration needed)

### Phase 3 - Advanced Features
- [ ] Backend proxy server
- [ ] User authentication
- [ ] Usage analytics dashboard
- [ ] Subscription management
- [ ] Team collaboration UI
- [ ] Cloud sync
- [ ] Advanced AI features (code generation, debugging)

## 🐛 Troubleshooting

### Common Issues

**App won't start**
- Ensure Node.js v16+ is installed
- Run `npm install` to install dependencies
- Check console for error messages

**AI features not working**
- Verify OpenAI API key is set correctly
- Check internet connection
- Ensure API key has sufficient credits

**Editor not loading**
- Check browser console for errors
- Ensure Monaco Editor CDN is accessible
- Try running in development mode

**File operations not working**
- Check file permissions
- Ensure file paths are valid
- Verify Electron has necessary permissions

### Debug Mode
Run the app in development mode to see detailed logs:
```bash
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Monaco Editor**: The powerful code editor that powers VS Code
- **Electron**: The framework for building cross-platform desktop apps
- **OpenAI**: The AI models that power the intelligent features
- **VS Code**: Inspiration for the user interface and experience

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**Note**: This is a demonstration project. For production use, consider implementing additional security measures, proper error handling, and user authentication.
