# Quick Setup Guide - Cursor Clone

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Application
```bash
npm start
```

### 3. Set Up OpenAI API Key
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Click the key icon (🔑) in the toolbar or press `Ctrl+K`
3. Enter your API key and click "Save API Key"

## 🎯 First Steps

### Try the AI Features
1. **Open the example file**: File → Open → `example.js`
2. **Test AI Chat**: Press `Ctrl+L` to open the chat panel
3. **Ask questions**: Try "Explain the Calculator class" or "How can I improve this code?"
4. **Test code refactoring**: Select some code, right-click, choose "Refactor Code"
5. **Test code explanation**: Select code, right-click, choose "Explain Code"

### Keyboard Shortcuts
- `Ctrl+N`: New file
- `Ctrl+O`: Open file
- `Ctrl+S`: Save file
- `Ctrl+K`: Set API key
- `Ctrl+L`: Toggle AI chat panel
- `Ctrl+Q`: Quit application

### AI Features Available
- ✅ **Inline completions**: Type code and get AI suggestions
- ✅ **Chat with context**: Ask questions about your code
- ✅ **Code refactoring**: Right-click to refactor selected code
- ✅ **Code explanation**: Get detailed explanations of code
- ✅ **Multi-language support**: JavaScript, Python, HTML, CSS, etc.

## 🔧 Troubleshooting

### App won't start?
- Make sure Node.js v16+ is installed
- Run `npm install` again
- Check console for error messages

### AI features not working?
- Verify your OpenAI API key is set correctly
- Check your internet connection
- Ensure your API key has sufficient credits

### Editor not loading?
- Check if Monaco Editor CDN is accessible
- Try running in development mode: `npm run dev`

## 📝 Example Usage

### 1. Code Completion
Type this in the editor:
```javascript
function calculateArea(radius) {
    // Type here and wait for AI completion
}
```

### 2. Code Refactoring
Select this code and right-click → "Refactor Code":
```javascript
function getUsers() {
    let users = [];
    for(let i = 0; i < data.length; i++) {
        if(data[i].active) {
            users.push(data[i]);
        }
    }
    return users;
}
```

### 3. Code Explanation
Select any code and right-click → "Explain Code" to get a detailed explanation.

### 4. Chat with Context
1. Select some code
2. Open chat panel (`Ctrl+L`)
3. Click "Send Selected"
4. Ask: "How can I improve this code?"

## 🎨 Customization

### Change AI Model
Edit `services/ai-service.js`:
```javascript
this.model = 'gpt-4o-mini'; // Change to 'gpt-4' or other models
```

### Adjust Editor Settings
Edit `renderer/app.js` in the Monaco Editor configuration:
```javascript
fontSize: 14, // Change font size
theme: 'vs-dark-custom', // Change theme
```

### Add New Languages
Edit the language mapping in `renderer/app.js`:
```javascript
const languageMap = {
    'js': 'javascript',
    'py': 'python',
    // Add your language here
    'rs': 'rust'
};
```

## 🚧 Development

### Run in Development Mode
```bash
npm run dev
```
This opens DevTools for debugging.

### Build for Distribution
```bash
npm run build
```

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review the troubleshooting section
- Check the console for error messages
- Ensure all dependencies are installed correctly

---

**Happy coding with AI assistance! 🤖✨**
