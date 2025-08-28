const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;

// AI service instance
let aiService = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Optional: add an icon
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development mode
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window close event
  mainWindow.on('close', (event) => {
    // Clear any stored API keys from memory
    if (aiService) {
      aiService.clearApiKey();
    }
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-file');
          }
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: 'JavaScript', extensions: ['js', 'jsx', 'ts', 'tsx'] },
                { name: 'Python', extensions: ['py'] },
                { name: 'HTML', extensions: ['html', 'htm'] },
                { name: 'CSS', extensions: ['css'] },
                { name: 'JSON', extensions: ['json'] }
              ]
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0];
              const content = fs.readFileSync(filePath, 'utf8');
              mainWindow.webContents.send('file-opened', { path: filePath, content });
            }
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save-file');
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: 'JavaScript', extensions: ['js'] },
                { name: 'Python', extensions: ['py'] },
                { name: 'HTML', extensions: ['html'] },
                { name: 'CSS', extensions: ['css'] },
                { name: 'JSON', extensions: ['json'] }
              ]
            });

            if (!result.canceled) {
              mainWindow.webContents.send('menu-save-as', { path: result.filePath });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'AI',
      submenu: [
        {
          label: 'Set API Key',
          click: () => {
            mainWindow.webContents.send('show-api-key-modal');
          }
        },
        {
          label: 'Clear API Key',
          click: () => {
            if (aiService) {
              aiService.clearApiKey();
            }
            mainWindow.webContents.send('api-key-cleared');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Cursor Clone',
              message: 'Cursor Clone v1.0.0',
              detail: 'A VS Code-like editor with AI assistance built with Electron and Monaco Editor.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Initialize AI service
function initializeAIService() {
  const { AIManager } = require('./services/ai-manager');
  aiService = new AIManager();
}

// IPC handlers for AI functionality
ipcMain.handle('ai-complete', async (event, { text, cursorPosition, language }) => {
  try {
    if (!aiService) {
      throw new Error('AI service not initialized');
    }
    
    const completion = await aiService.getInlineCompletion(text, cursorPosition, language);
    return { success: true, completion };
  } catch (error) {
    console.error('AI completion error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ai-chat', async (event, { message, context }) => {
  try {
    if (!aiService) {
      throw new Error('AI service not initialized');
    }
    
    const response = await aiService.chat(message, context);
    return { success: true, response };
  } catch (error) {
    console.error('AI chat error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ai-refactor', async (event, { code, language }) => {
  try {
    if (!aiService) {
      throw new Error('AI service not initialized');
    }
    
    const refactoredCode = await aiService.refactorCode(code, language);
    return { success: true, refactoredCode };
  } catch (error) {
    console.error('AI refactor error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ai-explain', async (event, { code, language }) => {
  try {
    if (!aiService) {
      throw new Error('AI service not initialized');
    }
    
    const explanation = await aiService.explainCode(code, language);
    return { success: true, explanation };
  } catch (error) {
    console.error('AI explain error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-api-key', async (event, apiKey) => {
  try {
    if (!aiService) {
      throw new Error('AI service not initialized');
    }
    
    await aiService.setApiKey(apiKey);
    return { success: true };
  } catch (error) {
    console.error('Set API key error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-api-key-status', async () => {
  try {
    if (!aiService) {
      return { hasKey: false };
    }
    
    const hasKey = await aiService.hasValidApiKey();
    return { hasKey };
  } catch (error) {
    return { hasKey: false };
  }
});

// New AI provider handlers
ipcMain.handle('ai-generate', async (event, { description, language }) => {
  try {
    if (!aiService) {
      throw new Error('AI service not initialized');
    }
    
    const generatedCode = await aiService.generateCode(description, language);
    return { success: true, generatedCode };
  } catch (error) {
    console.error('AI generate error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('initialize-ai-provider', async (event, { providerType, config }) => {
  try {
    if (!aiService) {
      throw new Error('AI service not initialized');
    }
    
    const result = await aiService.initializeProvider(providerType, config);
    return { success: true, result };
  } catch (error) {
    console.error('Initialize AI provider error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('test-ai-connection', async (event, { providerType, config }) => {
  try {
    if (!aiService) {
      throw new Error('AI service not initialized');
    }
    
    const result = await aiService.testConnection(providerType, config);
    return { success: true, result };
  } catch (error) {
    console.error('Test AI connection error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-ai-provider-info', async () => {
  try {
    if (!aiService) {
      return { type: null, name: 'None', status: 'Not configured' };
    }
    
    const info = aiService.getCurrentProviderInfo();
    return { success: true, info };
  } catch (error) {
    console.error('Get AI provider info error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-available-models', async (event, { providerType }) => {
  try {
    if (!aiService) {
      return { models: [] };
    }
    
    const models = await aiService.getAvailableModels(providerType);
    return { success: true, models };
  } catch (error) {
    console.error('Get available models error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clear-ai-provider', async () => {
  try {
    if (!aiService) {
      return { success: true };
    }
    
    aiService.clearProvider();
    return { success: true };
  } catch (error) {
    console.error('Clear AI provider error:', error);
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
  initializeAIService();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});
