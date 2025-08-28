# Quick Reference Guide - Cursor Clone

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start

# Build for distribution
npm run build
```

## 📁 Key Files & Their Purpose

### Core Files
- **`main.js`** - Electron main process, window management, IPC handlers
- **`preload.js`** - Secure IPC bridge between main and renderer processes
- **`services/ai-service.js`** - OpenAI API integration and AI functionality

### Frontend Files
- **`renderer/index.html`** - Main HTML structure
- **`renderer/styles.css`** - VS Code-like dark theme styling
- **`renderer/app.js`** - Monaco Editor integration and UI logic

### Configuration
- **`package.json`** - Dependencies, scripts, and build configuration
- **`.gitignore`** - Git ignore rules for Node.js/Electron projects

## 🔧 Common Development Tasks

### Adding New AI Provider
1. Create new service in `services/` directory
2. Implement required methods: `getInlineCompletion()`, `chat()`, `refactorCode()`, `explainCode()`
3. Update `main.js` to use new service

### Adding New Language Support
1. Update language mapping in `renderer/app.js`:
```javascript
const languageMap = {
    'js': 'javascript',
    'py': 'python',
    'your-ext': 'your-language'
};
```

### Changing AI Model
Edit `services/ai-service.js`:
```javascript
this.model = 'gpt-4o-mini'; // Change to desired model
```

### Customizing Editor Theme
Edit `renderer/app.js` in Monaco Editor configuration:
```javascript
theme: 'vs-dark-custom', // Change theme
fontSize: 14, // Change font size
```

## 🐛 Troubleshooting

### App won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### AI features not working
- Check OpenAI API key is set correctly
- Verify internet connection
- Check API key has sufficient credits

### Editor not loading
- Check Monaco Editor CDN accessibility
- Try running in development mode: `npm run dev`

## 📝 Git Workflow

```bash
# Make changes
git add .
git commit -m "Your commit message"
git push

# Create new branch for features
git checkout -b feature-name
git push -u origin feature-name
```

## 🔗 Important URLs

- **Repository**: https://github.com/Nabea-ken/cursor
- **Electron Docs**: https://www.electronjs.org/docs
- **Monaco Editor**: https://microsoft.github.io/monaco-editor/
- **OpenAI API**: https://platform.openai.com/docs

## 🎯 Future Development Ideas

### Phase 2 Features
- File explorer panel
- Multi-file context retrieval
- Git integration
- Search and replace
- Multiple AI model support

### Phase 3 Features
- Backend proxy server
- User authentication
- Usage analytics
- Subscription management
- Team collaboration

## 📚 Documentation Files

- **`README.md`** - Comprehensive project documentation
- **`SETUP.md`** - Quick setup guide for users
- **`docs/development-conversation.md`** - Complete development log
- **`docs/quick-reference.md`** - This file

---

**Last Updated**: August 28, 2025  
**Project Status**: ✅ Complete and deployed
