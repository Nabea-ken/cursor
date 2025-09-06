const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('ai', {
  // AI completion functionality
  getInlineCompletion: (text, cursorPosition, language) => 
    ipcRenderer.invoke('ai-complete', { text, cursorPosition, language }),
  
  // Chat functionality
  chat: (message, context) => 
    ipcRenderer.invoke('ai-chat', { message, context }),
  
  // Code refactoring
  refactorCode: (code, language) => 
    ipcRenderer.invoke('ai-refactor', { code, language }),
  
  // Code explanation
  explainCode: (code, language) => 
    ipcRenderer.invoke('ai-explain', { code, language }),
  
  // Code generation
  generateCode: (description, language) => 
    ipcRenderer.invoke('ai-generate', { description, language }),
  
  // AI provider management
  initializeProvider: (providerType, config) => 
    ipcRenderer.invoke('initialize-ai-provider', { providerType, config }),
  
  testConnection: (providerType, config) => 
    ipcRenderer.invoke('test-ai-connection', { providerType, config }),
  
  getProviderInfo: () => 
    ipcRenderer.invoke('get-ai-provider-info'),
  
  getAvailableModels: (providerType) => 
    ipcRenderer.invoke('get-available-models', { providerType }),
  
  clearProvider: () => 
    ipcRenderer.invoke('clear-ai-provider'),
  
  // API key management
  setApiKey: (apiKey) => 
    ipcRenderer.invoke('set-api-key', apiKey),
  
  getApiKeyStatus: () => 
    ipcRenderer.invoke('get-api-key-status'),
  
  // Listen for API key status changes
  onApiKeyCleared: (callback) => 
    ipcRenderer.on('api-key-cleared', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => 
    ipcRenderer.removeAllListeners(channel)
});

// Expose file operations
contextBridge.exposeInMainWorld('file', {
  // File operations
  openFile: () => 
    ipcRenderer.invoke('open-file'),
  
  saveFile: (content, path) => 
    ipcRenderer.invoke('save-file', { content, path }),
  
  getFileTree: (folderPath) => 
    ipcRenderer.invoke('get-file-tree', { folderPath }),
  
  openFileFromPath: (filePath) => 
    ipcRenderer.invoke('open-file-from-path', { filePath }),
  
  // Listen for file operations from menu
  onNewFile: (callback) => 
    ipcRenderer.on('menu-new-file', callback),
  
  onFileOpened: (callback) => 
    ipcRenderer.on('file-opened', callback),
  
  onFolderOpened: (callback) => 
    ipcRenderer.on('folder-opened', callback),
  
  onSaveFile: (callback) => 
    ipcRenderer.on('menu-save-file', callback),
  
  onSaveAs: (callback) => 
    ipcRenderer.on('menu-save-as', callback),
  
  // API key modal
  onShowApiKeyModal: (callback) => 
    ipcRenderer.on('show-api-key-modal', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => 
    ipcRenderer.removeAllListeners(channel)
});

// Expose utility functions
contextBridge.exposeInMainWorld('utils', {
  // Get platform information
  platform: process.platform,
  
  // Check if in development mode
  isDev: process.argv.includes('--dev')
});

// Expose Git service functions
contextBridge.exposeInMainWorld('git', {
  initialize: (directoryPath) => 
    ipcRenderer.invoke('git-initialize', { directoryPath }),
  
  getStatus: () => 
    ipcRenderer.invoke('git-get-status'),
  
  getContext: (filePath) => 
    ipcRenderer.invoke('git-get-context', { filePath })
});

// Expose Terminal service functions
contextBridge.exposeInMainWorld('terminal', {
  execute: (command, sessionId) => 
    ipcRenderer.invoke('terminal-execute', { command, sessionId }),
  
  executeCommand: (command, sessionId) => 
    ipcRenderer.invoke('terminal-execute', { command, sessionId }),
  
  executeWithAI: (description, sessionId) => 
    ipcRenderer.invoke('terminal-execute-ai', { description, sessionId }),
  
  generateCommandFromDescription: (description) => 
    ipcRenderer.invoke('terminal-generate-command', { description }),
  
  getSuggestions: (partialCommand, context) => 
    ipcRenderer.invoke('terminal-get-suggestions', { partialCommand, context })
});

// Expose Snippets service functions
contextBridge.exposeInMainWorld('snippets', {
  create: (snippetData) => 
    ipcRenderer.invoke('snippets-create', { snippetData }),
  
  getAll: () => 
    ipcRenderer.invoke('snippets-get-all'),
  
  search: (query) => 
    ipcRenderer.invoke('snippets-search', { query })
});

// Expose Database service functions
contextBridge.exposeInMainWorld('database', {
  setPreference: (key, value) => 
    ipcRenderer.invoke('db-set-preference', { key, value }),
  
  getPreference: (key, defaultValue) => 
    ipcRenderer.invoke('db-get-preference', { key, defaultValue }),
  
  logAIInteraction: (interaction) => 
    ipcRenderer.invoke('db-log-ai-interaction', { interaction }),
  
  getAnalytics: () => 
    ipcRenderer.invoke('db-get-analytics')
});

// Expose Collaboration service functions
contextBridge.exposeInMainWorld('collaboration', {
  createRoom: (roomConfig) => 
    ipcRenderer.invoke('collab-create-room', { roomConfig }),
  
  joinRoom: (roomId, password) => 
    ipcRenderer.invoke('collab-join-room', { roomId, password }),
  
  sendMessage: (roomId, message) => 
    ipcRenderer.invoke('collab-send-message', { roomId, message }),
  
  getRooms: () => 
    ipcRenderer.invoke('collab-get-rooms')
});

// Expose Debug service functions
contextBridge.exposeInMainWorld('debug', {
  analyzeCode: (code, language) => 
    ipcRenderer.invoke('debug-analyze-code', { code, language }),
  
  getDebuggingTips: (language) => 
    ipcRenderer.invoke('debug-get-tips', { language }),
  
  generateReport: (sessionId) => 
    ipcRenderer.invoke('debug-generate-report', { sessionId })
});

// Expose Snippets service functions
contextBridge.exposeInMainWorld('snippets', {
  create: (snippetData) => 
    ipcRenderer.invoke('snippets-create', { snippetData }),
  
  getAll: () => 
    ipcRenderer.invoke('snippets-get-all'),
  
  search: (query) => 
    ipcRenderer.invoke('snippets-search', { query }),
  
  generateSnippetFromAI: (description, language, category) => 
    ipcRenderer.invoke('snippets-generate-ai', { description, language, category }),
  
  delete: (snippetId) => 
    ipcRenderer.invoke('snippets-delete', { snippetId })
});
