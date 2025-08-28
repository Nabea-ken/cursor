// Global variables
let editor = null;
let currentFilePath = null;
let currentLanguage = 'javascript';
let chatPanelVisible = false;
let apiKeySet = false;
let completionTimeout = null;

// DOM elements
const elements = {
    // Editor
    editorContainer: document.getElementById('monaco-editor'),
    
    // Toolbar
    newFileBtn: document.getElementById('new-file-btn'),
    openFileBtn: document.getElementById('open-file-btn'),
    saveFileBtn: document.getElementById('save-file-btn'),
    fileName: document.getElementById('file-name'),
    apiKeyBtn: document.getElementById('api-key-btn'),
    toggleChatBtn: document.getElementById('toggle-chat-btn'),
    
    // Chat panel
    chatPanel: document.getElementById('chat-panel'),
    closeChatBtn: document.getElementById('close-chat-btn'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendChatBtn: document.getElementById('send-chat-btn'),
    sendSelectedBtn: document.getElementById('send-selected-btn'),
    sendFileBtn: document.getElementById('send-file-btn'),
    apiKeyNotice: document.getElementById('api-key-notice'),
    setApiKeyChatBtn: document.getElementById('set-api-key-chat-btn'),
    
    // Status bar
    cursorPosition: document.getElementById('cursor-position'),
    fileLanguage: document.getElementById('file-language'),
    aiStatus: document.getElementById('ai-status'),
    
    // Modal
    apiKeyModal: document.getElementById('api-key-modal'),
    apiKeyInput: document.getElementById('api-key-input'),
    saveApiKeyBtn: document.getElementById('save-api-key-btn'),
    cancelApiKeyBtn: document.getElementById('cancel-api-key-btn'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    
    // Context menu
    contextMenu: document.getElementById('context-menu'),
    refactorMenuItem: document.getElementById('refactor-menu-item'),
    explainMenuItem: document.getElementById('explain-menu-item'),
    copyMenuItem: document.getElementById('copy-menu-item'),
    cutMenuItem: document.getElementById('cut-menu-item'),
    pasteMenuItem: document.getElementById('paste-menu-item'),
    
    // Loading
    loadingOverlay: document.getElementById('loading-overlay')
};

// Initialize the application
async function init() {
    showLoading(true);
    
    try {
        // Initialize Monaco Editor
        await initMonacoEditor();
        
        // Set up event listeners
        setupEventListeners();
        
        // Check API key status
        await checkApiKeyStatus();
        
        // Load default content
        loadDefaultContent();
        
        showLoading(false);
    } catch (error) {
        console.error('Initialization error:', error);
        showLoading(false);
        showError('Failed to initialize application: ' + error.message);
    }
}

// Initialize Monaco Editor
async function initMonacoEditor() {
    return new Promise((resolve, reject) => {
        require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs' } });
        
        require(['vs/editor/editor.main'], function () {
            try {
                // Configure Monaco Editor
                monaco.editor.defineTheme('vs-dark-custom', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [],
                    colors: {
                        'editor.background': '#1e1e1e',
                        'editor.foreground': '#d4d4d4',
                        'editor.lineHighlightBackground': '#2a2a2a',
                        'editor.selectionBackground': '#264f78',
                        'editor.inactiveSelectionBackground': '#3a3d41'
                    }
                });

                // Create editor instance
                editor = monaco.editor.create(elements.editorContainer, {
                    value: '// Welcome to Cursor Clone!\n// Start coding here...\n\nfunction hello() {\n    console.log("Hello, World!");\n}',
                    language: 'javascript',
                    theme: 'vs-dark-custom',
                    fontSize: 14,
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    minimap: {
                        enabled: true,
                        side: 'right'
                    },
                    wordWrap: 'on',
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    parameterHints: {
                        enabled: true
                    },
                    hover: {
                        enabled: true
                    },
                    contextmenu: false, // We'll handle our own context menu
                    extraEditorClassName: 'monaco-editor-custom'
                });

                // Set up editor event listeners
                setupEditorEvents();
                
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Set up editor event listeners
function setupEditorEvents() {
    // Cursor position changes
    editor.onDidChangeCursorPosition((e) => {
        const position = e.position;
        elements.cursorPosition.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
        
        // Trigger inline completion
        if (apiKeySet) {
            triggerInlineCompletion();
        }
    });

    // Content changes
    editor.onDidChangeModelContent((e) => {
        // Update file name if unsaved
        if (currentFilePath) {
            elements.fileName.textContent = `${getFileName(currentFilePath)} *`;
        }
    });

    // Language changes
    editor.onDidChangeModelLanguage((e) => {
        currentLanguage = e.newLanguage;
        elements.fileLanguage.textContent = currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1);
    });

    // Context menu
    editor.onContextMenu((e) => {
        e.event.preventDefault();
        showContextMenu(e.event.posx, e.event.posy);
    });

    // Click outside context menu to close it
    document.addEventListener('click', (e) => {
        if (!elements.contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });
}

// Set up application event listeners
function setupEventListeners() {
    // Toolbar buttons
    elements.newFileBtn.addEventListener('click', newFile);
    elements.openFileBtn.addEventListener('click', openFile);
    elements.saveFileBtn.addEventListener('click', saveFile);
    elements.apiKeyBtn.addEventListener('click', showApiKeyModal);
    elements.toggleChatBtn.addEventListener('click', toggleChatPanel);

    // Chat panel
    elements.closeChatBtn.addEventListener('click', hideChatPanel);
    elements.sendChatBtn.addEventListener('click', sendChatMessage);
    elements.sendSelectedBtn.addEventListener('click', sendSelectedCode);
    elements.sendFileBtn.addEventListener('click', sendFileContent);
    elements.setApiKeyChatBtn.addEventListener('click', showApiKeyModal);

    // Chat input
    elements.chatInput.addEventListener('input', () => {
        elements.sendChatBtn.disabled = !elements.chatInput.value.trim();
    });

    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    // Modal
    elements.saveApiKeyBtn.addEventListener('click', saveApiKey);
    elements.cancelApiKeyBtn.addEventListener('click', hideApiKeyModal);
    elements.closeModalBtn.addEventListener('click', hideApiKeyModal);

    // Context menu
    elements.refactorMenuItem.addEventListener('click', refactorSelectedCode);
    elements.explainMenuItem.addEventListener('click', explainSelectedCode);
    elements.copyMenuItem.addEventListener('click', () => editor.trigger('keyboard', 'editor.action.clipboardCopyAction', {}));
    elements.cutMenuItem.addEventListener('click', () => editor.trigger('keyboard', 'editor.action.clipboardCutAction', {}));
    elements.pasteMenuItem.addEventListener('click', () => editor.trigger('keyboard', 'editor.action.clipboardPasteAction', {}));

    // File operations from menu
    window.file.onNewFile(() => newFile());
    window.file.onFileOpened((event, data) => {
        currentFilePath = data.path;
        editor.setValue(data.content);
        elements.fileName.textContent = getFileName(data.path);
        setLanguageFromFile(data.path);
    });
    window.file.onSaveFile(() => saveFile());
    window.file.onSaveAs((event, data) => saveFileAs(data.path));

    // API key modal from menu
    window.file.onShowApiKeyModal(() => showApiKeyModal());

    // API key status changes
    window.ai.onApiKeyCleared(() => {
        apiKeySet = false;
        updateAiStatus();
        showApiKeyNotice();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                newFile();
                break;
            case 'o':
                e.preventDefault();
                openFile();
                break;
            case 's':
                e.preventDefault();
                if (e.shiftKey) {
                    saveFileAs();
                } else {
                    saveFile();
                }
                break;
            case 'k':
                e.preventDefault();
                showApiKeyModal();
                break;
            case 'l':
                e.preventDefault();
                toggleChatPanel();
                break;
        }
    }
}

// File operations
function newFile() {
    currentFilePath = null;
    editor.setValue('');
    elements.fileName.textContent = 'Untitled';
    currentLanguage = 'javascript';
    editor.getModel().setValue('');
    monaco.editor.setModelLanguage(editor.getModel(), 'javascript');
    elements.fileLanguage.textContent = 'JavaScript';
}

function openFile() {
    // This will be handled by the main process via IPC
    console.log('Open file requested');
}

function saveFile() {
    if (!currentFilePath) {
        saveFileAs();
        return;
    }
    
    const content = editor.getValue();
    // In a real app, you'd save to the file system
    console.log('Saving file:', currentFilePath);
    elements.fileName.textContent = getFileName(currentFilePath);
}

function saveFileAs(path = null) {
    const content = editor.getValue();
    if (path) {
        currentFilePath = path;
        elements.fileName.textContent = getFileName(path);
        console.log('Saving file as:', path);
    }
}

// Chat panel functions
function toggleChatPanel() {
    if (chatPanelVisible) {
        hideChatPanel();
    } else {
        showChatPanel();
    }
}

function showChatPanel() {
    elements.chatPanel.classList.remove('hidden');
    elements.chatPanel.classList.add('show');
    chatPanelVisible = true;
    elements.toggleChatBtn.classList.add('active');
}

function hideChatPanel() {
    elements.chatPanel.classList.add('hidden');
    elements.chatPanel.classList.remove('show');
    chatPanelVisible = false;
    elements.toggleChatBtn.classList.remove('active');
}

// Chat functionality
async function sendChatMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;

    if (!apiKeySet) {
        showApiKeyModal();
        return;
    }

    // Add user message to chat
    addChatMessage(message, 'user');
    elements.chatInput.value = '';
    elements.sendChatBtn.disabled = true;

    try {
        showLoading(true);
        const response = await window.ai.chat(message);
        addChatMessage(response, 'ai');
    } catch (error) {
        addChatMessage(`Error: ${error.message}`, 'ai');
        console.error('Chat error:', error);
    } finally {
        showLoading(false);
    }
}

async function sendSelectedCode() {
    const selection = editor.getSelection();
    if (!selection) {
        addChatMessage('No code selected. Please select some code first.', 'ai');
        return;
    }

    const selectedCode = editor.getModel().getValueInRange(selection);
    const message = `Here's the selected code:\n\n\`\`\`${currentLanguage}\n${selectedCode}\n\`\`\`\n\nCan you help me with this code?`;
    
    addChatMessage(message, 'user');
    
    try {
        showLoading(true);
        const response = await window.ai.chat('Please analyze this code and provide suggestions or explanations.', selectedCode);
        addChatMessage(response, 'ai');
    } catch (error) {
        addChatMessage(`Error: ${error.message}`, 'ai');
        console.error('Chat error:', error);
    } finally {
        showLoading(false);
    }
}

async function sendFileContent() {
    const content = editor.getValue();
    if (!content.trim()) {
        addChatMessage('The file is empty.', 'ai');
        return;
    }

    const message = `Here's the entire file content:\n\n\`\`\`${currentLanguage}\n${content}\n\`\`\`\n\nCan you help me with this code?`;
    
    addChatMessage(message, 'user');
    
    try {
        showLoading(true);
        const response = await window.ai.chat('Please analyze this code and provide suggestions or explanations.', content);
        addChatMessage(response, 'ai');
    } catch (error) {
        addChatMessage(`Error: ${error.message}`, 'ai');
        console.error('Chat error:', error);
    } finally {
        showLoading(false);
    }
}

function addChatMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender} slide-in`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    // Format code blocks
    const formattedContent = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
    });
    
    bubbleDiv.innerHTML = formattedContent;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(bubbleDiv);
    messageDiv.appendChild(timeDiv);
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// AI completion functionality
function triggerInlineCompletion() {
    if (completionTimeout) {
        clearTimeout(completionTimeout);
    }
    
    completionTimeout = setTimeout(async () => {
        try {
            const position = editor.getPosition();
            const model = editor.getModel();
            const text = model.getValue();
            
            const result = await window.ai.getInlineCompletion(text, {
                line: position.lineNumber - 1,
                column: position.column - 1
            }, currentLanguage);
            
            if (result.success && result.completion) {
                showInlineCompletion(result.completion, position);
            }
        } catch (error) {
            console.error('Inline completion error:', error);
        }
    }, 1000); // Delay to avoid too many API calls
}

function showInlineCompletion(completion, position) {
    // This is a simplified version. In a real implementation,
    // you'd use Monaco's ghost text feature or similar
    console.log('Inline completion:', completion);
}

// Context menu functions
function showContextMenu(x, y) {
    elements.contextMenu.style.left = x + 'px';
    elements.contextMenu.style.top = y + 'px';
    elements.contextMenu.classList.add('show');
}

function hideContextMenu() {
    elements.contextMenu.classList.remove('show');
}

async function refactorSelectedCode() {
    const selection = editor.getSelection();
    if (!selection) {
        showError('No code selected for refactoring');
        return;
    }

    const selectedCode = editor.getModel().getValueInRange(selection);
    
    try {
        showLoading(true);
        const result = await window.ai.refactorCode(selectedCode, currentLanguage);
        
        if (result.success) {
            editor.executeEdits('refactor', [{
                range: selection,
                text: result.refactoredCode
            }]);
            hideContextMenu();
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Refactoring failed: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function explainSelectedCode() {
    const selection = editor.getSelection();
    if (!selection) {
        showError('No code selected for explanation');
        return;
    }

    const selectedCode = editor.getModel().getValueInRange(selection);
    
    try {
        showLoading(true);
        const result = await window.ai.explainCode(selectedCode, currentLanguage);
        
        if (result.success) {
            addChatMessage(result.explanation, 'ai');
            showChatPanel();
            hideContextMenu();
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Explanation failed: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// API key management
async function checkApiKeyStatus() {
    try {
        const result = await window.ai.getApiKeyStatus();
        apiKeySet = result.hasKey;
        updateAiStatus();
        
        if (!apiKeySet) {
            showApiKeyNotice();
        } else {
            hideApiKeyNotice();
        }
    } catch (error) {
        console.error('API key status check failed:', error);
        apiKeySet = false;
        updateAiStatus();
        showApiKeyNotice();
    }
}

function showApiKeyModal() {
    elements.apiKeyModal.classList.add('show');
    elements.apiKeyInput.focus();
}

function hideApiKeyModal() {
    elements.apiKeyModal.classList.remove('show');
    elements.apiKeyInput.value = '';
}

async function saveApiKey() {
    const apiKey = elements.apiKeyInput.value.trim();
    if (!apiKey) {
        showError('Please enter an API key');
        return;
    }

    try {
        showLoading(true);
        const result = await window.ai.setApiKey(apiKey);
        
        if (result.success) {
            apiKeySet = true;
            updateAiStatus();
            hideApiKeyNotice();
            hideApiKeyModal();
            showSuccess('API key saved successfully');
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Failed to save API key: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function updateAiStatus() {
    if (apiKeySet) {
        elements.aiStatus.innerHTML = '<i class="fas fa-circle"></i> AI Ready';
        elements.aiStatus.classList.remove('error');
    } else {
        elements.aiStatus.innerHTML = '<i class="fas fa-circle"></i> AI Not Ready';
        elements.aiStatus.classList.add('error');
    }
}

function showApiKeyNotice() {
    elements.apiKeyNotice.style.display = 'flex';
}

function hideApiKeyNotice() {
    elements.apiKeyNotice.style.display = 'none';
}

// Utility functions
function getFileName(path) {
    return path ? path.split(/[\\/]/).pop() : 'Untitled';
}

function setLanguageFromFile(path) {
    const ext = path.split('.').pop().toLowerCase();
    const languageMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'json': 'json',
        'md': 'markdown',
        'xml': 'xml',
        'sql': 'sql',
        'php': 'php',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'cs': 'csharp',
        'go': 'go',
        'rs': 'rust',
        'rb': 'ruby'
    };
    
    const language = languageMap[ext] || 'plaintext';
    currentLanguage = language;
    editor.getModel().setValue(editor.getValue());
    monaco.editor.setModelLanguage(editor.getModel(), language);
    elements.fileLanguage.textContent = language.charAt(0).toUpperCase() + language.slice(1);
}

function loadDefaultContent() {
    const defaultContent = `// Welcome to Cursor Clone!
// This is an AI-powered code editor similar to Cursor

// Try these features:
// 1. Type some code and wait for AI completions
// 2. Select code and right-click for refactor/explain options
// 3. Open the AI chat panel to ask questions
// 4. Set your OpenAI API key to enable all AI features

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Example: Get the 10th Fibonacci number
console.log(fibonacci(10));

// You can also try:
// - Opening files (Ctrl+O)
// - Saving files (Ctrl+S)
// - Toggling the chat panel (Ctrl+L)
// - Setting your API key (Ctrl+K)
`;

    editor.setValue(defaultContent);
}

// UI utility functions
function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('show');
    } else {
        elements.loadingOverlay.classList.remove('show');
    }
}

function showError(message) {
    // Simple error display - in a real app you'd want a proper notification system
    console.error(message);
    alert(message);
}

function showSuccess(message) {
    // Simple success display - in a real app you'd want a proper notification system
    console.log(message);
    alert(message);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle window resize
window.addEventListener('resize', () => {
    if (editor) {
        editor.layout();
    }
});
