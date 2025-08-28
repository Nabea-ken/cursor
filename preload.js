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
  // Listen for file operations from menu
  onNewFile: (callback) => 
    ipcRenderer.on('menu-new-file', callback),
  
  onFileOpened: (callback) => 
    ipcRenderer.on('file-opened', callback),
  
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
