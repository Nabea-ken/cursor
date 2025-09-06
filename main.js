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
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory']
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const folderPath = result.filePaths[0];
              mainWindow.webContents.send('folder-opened', { path: folderPath });
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

// Initialize additional services (lazy loaded)
let gitService = null;
let terminalService = null;
let snippetsService = null;
let databaseService = null;

// Core services that are always needed
function initializeCoreServices() {
  try {
    const { DatabaseService } = require('./services/database-service');
    databaseService = new DatabaseService();
    
    // Initialize database service
    databaseService.initialize().then(() => {
      console.log('Database service initialized');
    }).catch(error => {
      console.error('Database initialization failed:', error);
    });
    
    console.log('Core services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize core services:', error);
  }
}

// Lazy load services when needed
function getGitService() {
  if (!gitService) {
    const { GitService } = require('./services/git-service');
    gitService = new GitService();
  }
  return gitService;
}

function getTerminalService() {
  if (!terminalService) {
    const { TerminalService } = require('./services/terminal-service');
    terminalService = new TerminalService();
  }
  return terminalService;
}

function getSnippetsService() {
  if (!snippetsService) {
    const { SnippetsService } = require('./services/snippets-service');
    snippetsService = new SnippetsService();
  }
  return snippetsService;
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

// Git service handlers
ipcMain.handle('git-initialize', async (event, { directoryPath }) => {
  try {
    const gitService = getGitService();
    const result = await gitService.initialize(directoryPath);
    return { success: true, result };
  } catch (error) {
    console.error('Git initialize error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-get-status', async () => {
  try {
    const gitService = getGitService();
    const result = await gitService.getStatus();
    return { success: true, result };
  } catch (error) {
    console.error('Git status error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-get-context', async (event, { filePath }) => {
  try {
    const gitService = getGitService();
    const result = await gitService.getAIContext(filePath);
    return { success: true, result };
  } catch (error) {
    console.error('Git context error:', error);
    return { success: false, error: error.message };
  }
});

// Terminal service handlers
ipcMain.handle('terminal-execute', async (event, { command, sessionId }) => {
  try {
    const terminalService = getTerminalService();
    const result = await terminalService.executeCommand(command, sessionId);
    return { success: true, result };
  } catch (error) {
    console.error('Terminal execute error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('terminal-execute-ai', async (event, { description, sessionId }) => {
  try {
    const terminalService = getTerminalService();
    const result = await terminalService.executeWithAI(description, sessionId);
    return { success: true, result };
  } catch (error) {
    console.error('Terminal AI execute error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('terminal-get-suggestions', async (event, { partialCommand, context }) => {
  try {
    const terminalService = getTerminalService();
    const suggestions = terminalService.getCommandSuggestions(partialCommand, context);
    return { success: true, suggestions };
  } catch (error) {
    console.error('Terminal suggestions error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('terminal-generate-command', async (event, { description }) => {
  try {
    const terminalService = getTerminalService();
    const command = await terminalService.generateCommandFromDescription(description);
    return { success: true, command };
  } catch (error) {
    console.error('Terminal generate command error:', error);
    return { success: false, error: error.message };
  }
});

// Snippets service handlers
ipcMain.handle('snippets-create', async (event, { snippetData }) => {
  try {
    const snippetsService = getSnippetsService();
    const result = await snippetsService.createSnippet(snippetData);
    return { success: true, result };
  } catch (error) {
    console.error('Snippets create error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('snippets-get-all', async () => {
  try {
    const snippetsService = getSnippetsService();
    const snippets = snippetsService.getAllSnippets();
    return { success: true, snippets };
  } catch (error) {
    console.error('Snippets get all error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('snippets-search', async (event, { query }) => {
  try {
    const snippetsService = getSnippetsService();
    const snippets = snippetsService.searchSnippets(query);
    return { success: true, snippets };
  } catch (error) {
    console.error('Snippets search error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('snippets-generate-ai', async (event, { description, language, category }) => {
  try {
    const snippetsService = getSnippetsService();
    const result = await snippetsService.generateSnippetFromAI(description, language, category);
    return { success: true, snippet: result };
  } catch (error) {
    console.error('Snippets AI generate error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('snippets-delete', async (event, { snippetId }) => {
  try {
    const snippetsService = getSnippetsService();
    const result = await snippetsService.deleteSnippet(snippetId);
    return { success: true, result };
  } catch (error) {
    console.error('Snippets delete error:', error);
    return { success: false, error: error.message };
  }
});

// Database service handlers
ipcMain.handle('db-set-preference', async (event, { key, value }) => {
  try {
    if (!databaseService) {
      throw new Error('Database service not initialized');
    }
    
    const result = await databaseService.setPreference(key, value);
    return { success: true, result };
  } catch (error) {
    console.error('Database set preference error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-preference', async (event, { key, defaultValue }) => {
  try {
    if (!databaseService) {
      throw new Error('Database service not initialized');
    }
    
    const value = await databaseService.getPreference(key, defaultValue);
    return { success: true, value };
  } catch (error) {
    console.error('Database get preference error:', error);
    return { success: false, error: error.message };
  }
});


// File operation handlers
ipcMain.handle('open-file', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'JavaScript', extensions: ['js', 'jsx'] },
        { name: 'TypeScript', extensions: ['ts', 'tsx'] },
        { name: 'Python', extensions: ['py'] },
        { name: 'HTML', extensions: ['html', 'htm'] },
        { name: 'CSS', extensions: ['css'] },
        { name: 'JSON', extensions: ['json'] },
        { name: 'Markdown', extensions: ['md'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Send the file content back to the renderer
      return { success: true, path: filePath, content: content };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Open file error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-file', async (event, { content, path }) => {
  try {
    if (!path) {
      const result = await dialog.showSaveDialog({
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'JavaScript', extensions: ['js'] },
          { name: 'TypeScript', extensions: ['ts'] },
          { name: 'Python', extensions: ['py'] },
          { name: 'HTML', extensions: ['html'] },
          { name: 'CSS', extensions: ['css'] },
          { name: 'JSON', extensions: ['json'] }
        ]
      });

      if (result.canceled) {
        return { success: false, canceled: true };
      }
      
      path = result.filePath;
    }

    fs.writeFileSync(path, content, 'utf8');
    return { success: true, path: path };
  } catch (error) {
    console.error('Save file error:', error);
    return { success: false, error: error.message };
  }
});

// File tree operations
ipcMain.handle('get-file-tree', async (event, { folderPath }) => {
  try {
    const tree = await buildFileTree(folderPath);
    return { success: true, tree };
  } catch (error) {
    console.error('Get file tree error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-file-from-path', async (event, { filePath }) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    console.error('Open file from path error:', error);
    return { success: false, error: error.message };
  }
});

// Helper function to build file tree
async function buildFileTree(folderPath, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) {
    return [];
  }

  try {
    const items = await fs.promises.readdir(folderPath, { withFileTypes: true });
    const tree = [];

    for (const item of items) {
      // Skip hidden files and common ignore patterns
      if (item.name.startsWith('.') || 
          item.name === 'node_modules' || 
          item.name === '.git' ||
          item.name === 'dist' ||
          item.name === 'build') {
        continue;
      }

      const fullPath = path.join(folderPath, item.name);
      
      if (item.isDirectory()) {
        const children = await buildFileTree(fullPath, maxDepth, currentDepth + 1);
        tree.push({
          name: item.name,
          path: fullPath,
          type: 'folder',
          children: children,
          expanded: false
        });
      } else {
        tree.push({
          name: item.name,
          path: fullPath,
          type: 'file'
        });
      }
    }

    // Sort: folders first, then files, both alphabetically
    tree.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return tree;
  } catch (error) {
    console.error('Error building file tree:', error);
    return [];
  }
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
  initializeAIService();
  initializeCoreServices(); // Only initialize core services at startup

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
