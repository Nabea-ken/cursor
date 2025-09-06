// Global variables
let editor = null;
let currentFilePath = null;
let currentLanguage = 'javascript';
let chatPanelVisible = false;
let apiKeySet = false;
let completionTimeout = null;
let tabs = [];
let activeTabId = null;
let tabCounter = 0;
let currentWorkspace = null;
let fileTreeData = [];
let recentFiles = [];

// DOM elements
const elements = {
    // Editor
    editorContainer: document.getElementById('monaco-editor'),
    tabsContainer: document.getElementById('tabs-container'),
    newTabBtn: document.getElementById('new-tab-btn'),
    
    // File Explorer
    toggleExplorerBtn: document.getElementById('toggle-explorer-btn'),
    explorerPanel: document.getElementById('explorer-panel'),
    closeExplorerBtn: document.getElementById('close-explorer-btn'),
    newFolderBtn: document.getElementById('new-folder-btn'),
    refreshExplorerBtn: document.getElementById('refresh-explorer-btn'),
    fileTree: document.getElementById('file-tree'),
    
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
    loadingOverlay: document.getElementById('loading-overlay'),
    
    // AI Configuration elements
    aiProviderSelect: document.getElementById('ai-provider-select'),
    aiModelSelect: document.getElementById('ai-model-select'),
    aiTemperature: document.getElementById('ai-temperature'),
    temperatureValue: document.getElementById('temperature-value'),
    aiProviderStatus: document.getElementById('ai-provider-status'),
    
    // AI Provider Modal elements
    aiProviderModal: document.getElementById('ai-provider-modal'),
    closeAiModalBtn: document.getElementById('close-ai-modal-btn'),
    saveAiConfigBtn: document.getElementById('save-ai-config-btn'),
    cancelAiConfigBtn: document.getElementById('cancel-ai-config-btn'),
    aiProviderBtn: document.getElementById('ai-provider-btn'),
    
    // Simplified AI Provider elements
    providerOpenAI: document.getElementById('provider-openai'),
    providerOllama: document.getElementById('provider-ollama'),
    openaiConfig: document.getElementById('openai-config'),
    ollamaConfig: document.getElementById('ollama-config'),
    openaiApiKey: document.getElementById('openai-api-key'),
    ollamaUrl: document.getElementById('ollama-url'),
    
    // Search elements
    searchBtn: document.getElementById('search-btn'),
    searchBar: document.getElementById('search-bar'),
    searchInput: document.getElementById('search-input'),
    searchPrev: document.getElementById('search-prev'),
    searchNext: document.getElementById('search-next'),
    searchReplace: document.getElementById('search-replace'),
    searchClose: document.getElementById('search-close'),
    replaceContainer: document.getElementById('replace-container'),
    replaceInput: document.getElementById('replace-input'),
    replaceAll: document.getElementById('replace-all'),
    
    // Terminal elements
    toggleTerminalBtn: document.getElementById('toggle-terminal-btn'),
    terminalPanel: document.getElementById('terminal-panel'),
    closeTerminalBtn: document.getElementById('close-terminal-btn'),
    terminalOutput: document.getElementById('terminal-output'),
    terminalInput: document.getElementById('terminal-input'),
    sendTerminalBtn: document.getElementById('send-terminal-btn'),
    clearTerminalBtn: document.getElementById('clear-terminal-btn'),
    aiSuggestBtn: document.getElementById('ai-suggest-btn'),
    executeCommandBtn: document.getElementById('execute-command-btn'),
    
    // Debug elements
    toggleDebugBtn: document.getElementById('toggle-debug-btn'),
    debugPanel: document.getElementById('debug-panel'),
    closeDebugBtn: document.getElementById('close-debug-btn'),
    analyzeCurrentFileBtn: document.getElementById('analyze-current-file'),
    analyzeSelectedCodeBtn: document.getElementById('analyze-selected-code'),
    analysisResults: document.getElementById('analysis-results'),
    summaryContent: document.getElementById('summary-content'),
    issuesList: document.getElementById('issues-list'),
    suggestionsList: document.getElementById('suggestions-list'),
    debugLogsList: document.getElementById('debug-logs-list'),
    clearIssuesBtn: document.getElementById('clear-issues'),
    refreshSuggestionsBtn: document.getElementById('refresh-suggestions'),
    clearLogsBtn: document.getElementById('clear-logs'),
    exportLogsBtn: document.getElementById('export-logs'),
    
    // Snippets elements
    toggleSnippetsBtn: document.getElementById('toggle-snippets-btn'),
    snippetsPanel: document.getElementById('snippets-panel'),
    closeSnippetsBtn: document.getElementById('close-snippets-btn'),
    snippetsSearchInput: document.getElementById('snippets-search-input'),
    snippetsLanguageFilter: document.getElementById('snippets-language-filter'),
    snippetsCategoryFilter: document.getElementById('snippets-category-filter'),
    snippetsList: document.getElementById('snippets-list'),
    snippetName: document.getElementById('snippet-name'),
    snippetDescription: document.getElementById('snippet-description'),
    snippetLanguage: document.getElementById('snippet-language'),
    snippetCategory: document.getElementById('snippet-category'),
    snippetCode: document.getElementById('snippet-code'),
    snippetTags: document.getElementById('snippet-tags'),
    saveSnippetBtn: document.getElementById('save-snippet-btn'),
    clearSnippetFormBtn: document.getElementById('clear-snippet-form-btn'),
    aiSnippetDescription: document.getElementById('ai-snippet-description'),
    aiSnippetLanguage: document.getElementById('ai-snippet-language'),
    aiSnippetCategory: document.getElementById('ai-snippet-category'),
    generateSnippetBtn: document.getElementById('generate-snippet-btn'),
    aiGeneratedSnippet: document.getElementById('ai-generated-snippet'),
    useGeneratedSnippetBtn: document.getElementById('use-generated-snippet'),
    
    // Analytics elements
    toggleAnalyticsBtn: document.getElementById('toggle-analytics-btn'),
    analyticsPanel: document.getElementById('analytics-panel'),
    closeAnalyticsBtn: document.getElementById('close-analytics-btn'),
    refreshAnalyticsBtn: document.getElementById('refresh-analytics'),
    exportAnalyticsBtn: document.getElementById('export-analytics')
};

// Initialize the application
async function init() {
    showLoading(true);
    
    try {
        // Initialize Monaco Editor
        await initMonacoEditor();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize chat panel
        initializeChatPanel();
        
        // Check API key status
        await checkApiKeyStatus();
        
        // Create initial tab
        createTab(null, loadDefaultContent(), 'javascript');
        
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
    
    // Tab buttons
    if (elements.newTabBtn) {
        elements.newTabBtn.addEventListener('click', newFile);
    }
    
    // File Explorer buttons
    if (elements.toggleExplorerBtn) {
        elements.toggleExplorerBtn.addEventListener('click', toggleExplorerPanel);
    }
    if (elements.closeExplorerBtn) {
        elements.closeExplorerBtn.addEventListener('click', hideExplorerPanel);
    }
    if (elements.newFolderBtn) {
        elements.newFolderBtn.addEventListener('click', createNewFolder);
    }
    if (elements.refreshExplorerBtn) {
        elements.refreshExplorerBtn.addEventListener('click', refreshFileTree);
    }
    
    // Add drag and drop functionality
    setupDragAndDrop();

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

    // AI Provider Selection in Chat Panel
    if (elements.aiProviderSelect) {
        elements.aiProviderSelect.addEventListener('change', handleAiProviderChange);
    }
    if (elements.aiModelSelect) {
        elements.aiModelSelect.addEventListener('change', handleAiModelChange);
    }

    // Modal
    elements.saveApiKeyBtn.addEventListener('click', saveApiKey);
    elements.cancelApiKeyBtn.addEventListener('click', hideApiKeyModal);
    elements.closeModalBtn.addEventListener('click', hideApiKeyModal);
    
    // AI Provider Modal
    if (elements.aiProviderBtn) {
        elements.aiProviderBtn.addEventListener('click', showAiProviderModal);
    }
    if (elements.closeAiModalBtn) {
        elements.closeAiModalBtn.addEventListener('click', hideAiProviderModal);
    }
    if (elements.saveAiConfigBtn) {
        elements.saveAiConfigBtn.addEventListener('click', saveAiConfig);
    }
    if (elements.testAiConnectionBtn) {
        elements.testAiConnectionBtn.addEventListener('click', testAiConnection);
    }
    if (elements.cancelAiConfigBtn) {
        elements.cancelAiConfigBtn.addEventListener('click', hideAiProviderModal);
    }
    
    // Simplified AI Provider selection
    if (elements.providerOpenAI) {
        elements.providerOpenAI.addEventListener('change', () => {
            if (elements.providerOpenAI.checked) {
                elements.openaiConfig.classList.remove('hidden');
                elements.ollamaConfig.classList.add('hidden');
            }
        });
    }
    
    if (elements.providerOllama) {
        elements.providerOllama.addEventListener('change', () => {
            if (elements.providerOllama.checked) {
                elements.ollamaConfig.classList.remove('hidden');
                elements.openaiConfig.classList.add('hidden');
            }
        });
    }
    
    // AI Provider Modal tab switching
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            switchAiProviderTab(e.target.dataset.tab);
        }
    });
    
    // Search functionality
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', toggleSearchBar);
    }
    if (elements.searchClose) {
        elements.searchClose.addEventListener('click', hideSearchBar);
    }
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', performSearch);
        elements.searchInput.addEventListener('keydown', handleSearchKeydown);
    }
    if (elements.searchNext) {
        elements.searchNext.addEventListener('click', findNext);
    }
    if (elements.searchPrev) {
        elements.searchPrev.addEventListener('click', findPrevious);
    }
    if (elements.searchReplace) {
        elements.searchReplace.addEventListener('click', toggleReplace);
    }
    if (elements.replaceAll) {
        elements.replaceAll.addEventListener('click', replaceAll);
    }

    // Terminal functionality
    if (elements.toggleTerminalBtn) {
        elements.toggleTerminalBtn.addEventListener('click', toggleTerminalPanel);
    }
    if (elements.closeTerminalBtn) {
        elements.closeTerminalBtn.addEventListener('click', hideTerminalPanel);
    }
    if (elements.terminalInput) {
        elements.terminalInput.addEventListener('keydown', handleTerminalKeydown);
        elements.terminalInput.addEventListener('input', updateTerminalSendButton);
    }
    if (elements.sendTerminalBtn) {
        elements.sendTerminalBtn.addEventListener('click', sendTerminalMessage);
    }
    if (elements.clearTerminalBtn) {
        elements.clearTerminalBtn.addEventListener('click', clearTerminal);
    }
    if (elements.aiSuggestBtn) {
        elements.aiSuggestBtn.addEventListener('click', getAiCommandSuggestions);
    }
    if (elements.executeCommandBtn) {
        elements.executeCommandBtn.addEventListener('click', executeLastCommand);
    }

    // Debug functionality
    if (elements.toggleDebugBtn) {
        elements.toggleDebugBtn.addEventListener('click', toggleDebugPanel);
    }
    if (elements.closeDebugBtn) {
        elements.closeDebugBtn.addEventListener('click', hideDebugPanel);
    }
    if (elements.analyzeCurrentFileBtn) {
        elements.analyzeCurrentFileBtn.addEventListener('click', analyzeCurrentFile);
    }
    if (elements.analyzeSelectedCodeBtn) {
        elements.analyzeSelectedCodeBtn.addEventListener('click', analyzeSelectedCode);
    }
    if (elements.clearIssuesBtn) {
        elements.clearIssuesBtn.addEventListener('click', clearIssues);
    }
    if (elements.refreshSuggestionsBtn) {
        elements.refreshSuggestionsBtn.addEventListener('click', refreshSuggestions);
    }
    if (elements.clearLogsBtn) {
        elements.clearLogsBtn.addEventListener('click', clearDebugLogs);
    }
    if (elements.exportLogsBtn) {
        elements.exportLogsBtn.addEventListener('click', exportDebugLogs);
    }

    // Debug tab switching
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('debug-tab-btn')) {
            switchDebugTab(e.target.dataset.tab);
        }
    });

    // Snippets functionality
    if (elements.toggleSnippetsBtn) {
        elements.toggleSnippetsBtn.addEventListener('click', toggleSnippetsPanel);
    }
    if (elements.closeSnippetsBtn) {
        elements.closeSnippetsBtn.addEventListener('click', hideSnippetsPanel);
    }
    if (elements.snippetsSearchInput) {
        elements.snippetsSearchInput.addEventListener('input', filterSnippets);
    }
    if (elements.snippetsLanguageFilter) {
        elements.snippetsLanguageFilter.addEventListener('change', filterSnippets);
    }
    if (elements.snippetsCategoryFilter) {
        elements.snippetsCategoryFilter.addEventListener('change', filterSnippets);
    }
    if (elements.saveSnippetBtn) {
        elements.saveSnippetBtn.addEventListener('click', saveSnippet);
    }
    if (elements.clearSnippetFormBtn) {
        elements.clearSnippetFormBtn.addEventListener('click', clearSnippetForm);
    }
    if (elements.generateSnippetBtn) {
        elements.generateSnippetBtn.addEventListener('click', generateAISnippet);
    }
    if (elements.useGeneratedSnippetBtn) {
        elements.useGeneratedSnippetBtn.addEventListener('click', useGeneratedSnippet);
    }

    // Snippets tab switching
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('snippets-tab-btn')) {
            switchSnippetsTab(e.target.dataset.tab);
        }
    });

    // Analytics functionality
    if (elements.toggleAnalyticsBtn) {
        elements.toggleAnalyticsBtn.addEventListener('click', toggleAnalyticsPanel);
    }
    if (elements.closeAnalyticsBtn) {
        elements.closeAnalyticsBtn.addEventListener('click', hideAnalyticsPanel);
    }
    if (elements.refreshAnalyticsBtn) {
        elements.refreshAnalyticsBtn.addEventListener('click', refreshAnalytics);
    }
    if (elements.exportAnalyticsBtn) {
        elements.exportAnalyticsBtn.addEventListener('click', exportAnalytics);
    }

    // Analytics tab switching
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('analytics-tab-btn')) {
            switchAnalyticsTab(e.target.dataset.tab);
        }
    });

    // Context menu
    elements.refactorMenuItem.addEventListener('click', refactorSelectedCode);
    elements.explainMenuItem.addEventListener('click', explainSelectedCode);
    elements.copyMenuItem.addEventListener('click', () => editor.trigger('keyboard', 'editor.action.clipboardCopyAction', {}));
    elements.cutMenuItem.addEventListener('click', () => editor.trigger('keyboard', 'editor.action.clipboardCutAction', {}));
    elements.pasteMenuItem.addEventListener('click', () => editor.trigger('keyboard', 'editor.action.clipboardPasteAction', {}));

    // File operations from menu
    window.file.onNewFile(() => newFile());
    window.file.onFileOpened((event, data) => {
        const language = getLanguageFromFile(data.path);
        createTab(data.path, data.content, language);
    });
    window.file.onFolderOpened((event, data) => {
        openWorkspace(data.path);
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
            case 'f':
                e.preventDefault();
                toggleSearchBar();
                break;
        }
    }
}

// Tab management functions
function createTab(filePath = null, content = '', language = 'javascript') {
    const tabId = `tab_${++tabCounter}`;
    const fileName = filePath ? getFileName(filePath) : 'Untitled';
    
    const tab = {
        id: tabId,
        filePath: filePath,
        content: content,
        language: language,
        isDirty: false
    };
    
    tabs.push(tab);
    
    // Create tab element
    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.id = `tab-${tabId}`;
    tabElement.innerHTML = `
        <span class="tab-name">${fileName}</span>
        <button class="tab-close" onclick="closeTab('${tabId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    tabElement.addEventListener('click', (e) => {
        if (!e.target.closest('.tab-close')) {
            switchToTab(tabId);
        }
    });
    
    elements.tabsContainer.appendChild(tabElement);
    switchToTab(tabId);
    
    return tabId;
}

function switchToTab(tabId) {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    // Save current tab content
    if (activeTabId) {
        const currentTab = tabs.find(t => t.id === activeTabId);
        if (currentTab && editor) {
            currentTab.content = editor.getValue();
        }
    }
    
    // Switch to new tab
    activeTabId = tabId;
    
    // Update editor content
    if (editor) {
        editor.setValue(tab.content);
        monaco.editor.setModelLanguage(editor.getModel(), tab.language);
    }
    
    // Update UI
    updateTabUI();
    updateFileInfo(tab);
}

function closeTab(tabId) {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;
    
    const tab = tabs[tabIndex];
    const tabElement = document.getElementById(`tab-${tabId}`);
    
    // Remove tab element
    if (tabElement) {
        tabElement.remove();
    }
    
    // Remove from tabs array
    tabs.splice(tabIndex, 1);
    
    // If this was the active tab, switch to another
    if (activeTabId === tabId) {
        if (tabs.length > 0) {
            const newActiveIndex = Math.min(tabIndex, tabs.length - 1);
            switchToTab(tabs[newActiveIndex].id);
        } else {
            // No tabs left, create a new one
            createTab();
        }
    }
}

function updateTabUI() {
    // Update tab active states
    document.querySelectorAll('.tab').forEach(tabEl => {
        tabEl.classList.remove('active');
    });
    
    if (activeTabId) {
        const activeTabEl = document.getElementById(`tab-${activeTabId}`);
        if (activeTabEl) {
            activeTabEl.classList.add('active');
        }
    }
}

function updateFileInfo(tab) {
    currentFilePath = tab.filePath;
    currentLanguage = tab.language;
    
    if (elements.fileName) {
        elements.fileName.textContent = tab.filePath ? getFileName(tab.filePath) : 'Untitled';
    }
    
    if (elements.fileLanguage) {
        elements.fileLanguage.textContent = tab.language.charAt(0).toUpperCase() + tab.language.slice(1);
    }
}

// File Explorer functions
function toggleExplorerPanel() {
    if (elements.explorerPanel.classList.contains('show')) {
        hideExplorerPanel();
    } else {
        showExplorerPanel();
    }
}

function showExplorerPanel() {
    elements.explorerPanel.classList.add('show');
    elements.toggleExplorerBtn.classList.add('active');
}

function hideExplorerPanel() {
    elements.explorerPanel.classList.remove('show');
    elements.toggleExplorerBtn.classList.remove('active');
}

async function openWorkspace(folderPath) {
    try {
        currentWorkspace = folderPath;
        await loadFileTree(folderPath);
        showExplorerPanel();
        showSuccess(`Workspace opened: ${getFileName(folderPath)}`);
    } catch (error) {
        console.error('Error opening workspace:', error);
        showError('Failed to open workspace: ' + error.message);
    }
}

async function loadFileTree(folderPath) {
    try {
        // Request file tree from main process
        const result = await window.file.getFileTree(folderPath);
        if (result.success) {
            fileTreeData = result.tree;
            renderFileTree(fileTreeData);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error loading file tree:', error);
        throw error;
    }
}

function renderFileTree(tree, container = null) {
    if (!container) {
        container = elements.fileTree;
        container.innerHTML = '';
    }
    
    tree.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `file-tree-item ${item.type}`;
        itemElement.innerHTML = `
            <i class="fas ${item.type === 'folder' ? 'fa-folder' : 'fa-file'}"></i>
            <span>${item.name}</span>
        `;
        
        if (item.type === 'file') {
            itemElement.addEventListener('click', () => openFileFromTree(item.path));
        } else if (item.type === 'folder') {
            itemElement.addEventListener('click', () => toggleFolder(item, itemElement));
        }
        
        container.appendChild(itemElement);
        
        // Add children if folder is expanded
        if (item.type === 'folder' && item.expanded && item.children) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'file-tree-children';
            childrenContainer.style.paddingLeft = '20px';
            itemElement.appendChild(childrenContainer);
            renderFileTree(item.children, childrenContainer);
        }
    });
}

function toggleFolder(folder, element) {
    const childrenContainer = element.querySelector('.file-tree-children');
    
    if (childrenContainer) {
        // Folder is expanded, collapse it
        childrenContainer.remove();
        folder.expanded = false;
    } else {
        // Folder is collapsed, expand it
        if (folder.children && folder.children.length > 0) {
            const newChildrenContainer = document.createElement('div');
            newChildrenContainer.className = 'file-tree-children';
            newChildrenContainer.style.paddingLeft = '20px';
            element.appendChild(newChildrenContainer);
            renderFileTree(folder.children, newChildrenContainer);
            folder.expanded = true;
        }
    }
}

async function openFileFromTree(filePath) {
    try {
        const result = await window.file.openFileFromPath(filePath);
        if (result.success) {
            const language = getLanguageFromFile(filePath);
            createTab(filePath, result.content, language);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error opening file from tree:', error);
        showError('Failed to open file: ' + error.message);
    }
}

function createNewFolder() {
    if (!currentWorkspace) {
        showError('Please open a workspace first');
        return;
    }
    
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        // TODO: Implement folder creation
        showError('Folder creation not yet implemented');
    }
}

function refreshFileTree() {
    if (currentWorkspace) {
        loadFileTree(currentWorkspace);
    }
}

// File operations
function newFile() {
    createTab();
}

async function openFile() {
    try {
        const result = await window.file.openFile();
        
        if (result.success && !result.canceled) {
            const language = getLanguageFromFile(result.path);
            createTab(result.path, result.content, language);
        }
    } catch (error) {
        console.error('Error opening file:', error);
        showError('Failed to open file: ' + error.message);
    }
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

// AI Provider Selection Handlers
async function handleAiProviderChange() {
    const provider = elements.aiProviderSelect.value;
    console.log('AI Provider changed to:', provider);
    
    // Update model options based on provider
    await updateModelOptions(provider);
    
    // Set the provider in the AI manager
    try {
        if (provider === 'ollama') {
            // Use the configured Ollama settings
            const result = await window.ai.initializeProvider('ollama', {
                baseUrl: 'http://127.0.0.1:11434',
                model: 'llama3.2:1b'
            });
            if (result.success) {
                console.log('Ollama provider set successfully');
                updateAiProviderStatus('ollama', 'Connected');
            } else {
                console.error('Failed to set Ollama provider:', result.error);
                updateAiProviderStatus('ollama', 'Connection Failed');
            }
        } else if (provider === 'openai') {
            // For OpenAI, we need an API key
            if (!apiKeySet) {
                showApiKeyModal();
                return;
            }
            updateAiProviderStatus('openai', 'Configured');
        }
    } catch (error) {
        console.error('Error setting AI provider:', error);
        updateAiProviderStatus(provider, 'Error');
    }
}

async function handleAiModelChange() {
    const model = elements.aiModelSelect.value;
    console.log('AI Model changed to:', model);
    
    // Update the model in the current provider
    try {
        // This would need to be implemented in the AI manager
        // For now, just log the change
        console.log('Model updated to:', model);
    } catch (error) {
        console.error('Error setting AI model:', error);
    }
}

async function updateModelOptions(provider) {
    const modelSelect = elements.aiModelSelect;
    if (!modelSelect) return;
    
    // Clear existing options
    modelSelect.innerHTML = '';
    
    if (provider === 'ollama') {
        // Add Ollama models
        const option1 = document.createElement('option');
        option1.value = 'llama3.2:1b';
        option1.textContent = 'llama3.2:1b (1.2GB)';
        modelSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = 'codellama';
        option2.textContent = 'CodeLlama (Recommended)';
        modelSelect.appendChild(option2);
    } else if (provider === 'openai') {
        // Add OpenAI models
        const models = [
            { value: 'gpt-4o-mini', text: 'GPT-4o-mini (Fast)' },
            { value: 'gpt-4o', text: 'GPT-4o (Best)' },
            { value: 'gpt-3.5-turbo', text: 'GPT-3.5-turbo (Cheap)' }
        ];
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.text;
            modelSelect.appendChild(option);
        });
    } else {
        // Auto or other providers
        const option = document.createElement('option');
        option.value = 'auto';
        option.textContent = 'Auto Select';
        modelSelect.appendChild(option);
    }
}

function updateAiProviderStatus(provider, status) {
    if (elements.aiProviderStatus) {
        elements.aiProviderStatus.textContent = `${provider}: ${status}`;
        elements.aiProviderStatus.className = `ai-provider-status ${status.toLowerCase().replace(' ', '-')}`;
    }
}

function initializeChatPanel() {
    // Set default AI provider to Ollama since it's configured
    if (elements.aiProviderSelect) {
        elements.aiProviderSelect.value = 'ollama';
        // Trigger the change event to set up the provider
        handleAiProviderChange();
    }
    
    // Set default model
    if (elements.aiModelSelect) {
        elements.aiModelSelect.value = 'llama3.2:1b';
    }
}

// Chat functionality
async function sendChatMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;

    // Check if we have a valid AI provider configured
    const provider = elements.aiProviderSelect ? elements.aiProviderSelect.value : 'auto';
    
    if (provider === 'openai' && !apiKeySet) {
        showApiKeyModal();
        return;
    }

    // Add user message to chat
    addChatMessage(message, 'user');
    elements.chatInput.value = '';
    elements.sendChatBtn.disabled = true;

    try {
        showChatLoading(true);
        const result = await window.ai.chat(message);
        if (result.success) {
            addChatMessage(result.response, 'ai');
        } else {
            addChatMessage(`Error: ${result.error}`, 'ai');
        }
    } catch (error) {
        addChatMessage(`Error: ${error.message}`, 'ai');
        console.error('Chat error:', error);
    } finally {
        showChatLoading(false);
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
        showChatLoading(true);
        const result = await window.ai.chat('Please analyze this code and provide suggestions or explanations.', selectedCode);
        if (result.success) {
            addChatMessage(result.response, 'ai');
        } else {
            addChatMessage(`Error: ${result.error}`, 'ai');
        }
    } catch (error) {
        addChatMessage(`Error: ${error.message}`, 'ai');
        console.error('Chat error:', error);
    } finally {
        showChatLoading(false);
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
        showChatLoading(true);
        const result = await window.ai.chat('Please analyze this code and provide suggestions or explanations.', content);
        if (result.success) {
            addChatMessage(result.response, 'ai');
        } else {
            addChatMessage(`Error: ${result.error}`, 'ai');
        }
    } catch (error) {
        addChatMessage(`Error: ${error.message}`, 'ai');
        console.error('Chat error:', error);
    } finally {
        showChatLoading(false);
    }
}

function addChatMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender} slide-in`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    // Ensure content is a string
    const contentStr = typeof content === 'string' ? content : String(content || '');
    
    // Format code blocks
    const formattedContent = contentStr.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
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

function showChatLoading(show) {
    if (show) {
        // Add a loading message to the chat
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message ai loading';
        loadingDiv.id = 'chat-loading-message';
        loadingDiv.innerHTML = `
            <div class="message-bubble">
                <div class="loading-dots">
                    <span></span><span></span><span></span>
                </div>
                <span class="loading-text">AI is thinking...</span>
            </div>
        `;
        elements.chatMessages.appendChild(loadingDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    } else {
        // Remove the loading message
        const loadingMessage = document.getElementById('chat-loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }
}

// Enhanced AI completion functionality with caching and better context
let completionCache = new Map();
let lastCompletionRequest = null;

function triggerInlineCompletion() {
    if (completionTimeout) {
        clearTimeout(completionTimeout);
    }
    
    completionTimeout = setTimeout(async () => {
        try {
            if (!apiKeySet) return;
            
            const position = editor.getPosition();
            const model = editor.getModel();
            const text = model.getValue();
            
            // Create a cache key based on context
            const contextLines = getContextLines(text, position.lineNumber - 1, 5);
            const cacheKey = `${currentLanguage}:${contextLines.join('\n')}`;
            
            // Check cache first
            if (completionCache.has(cacheKey)) {
                const cachedCompletion = completionCache.get(cacheKey);
                showInlineCompletion(cachedCompletion, position);
                return;
            }
            
            // Cancel previous request if still pending
            if (lastCompletionRequest) {
                lastCompletionRequest.abort();
            }
            
            // Create abort controller for this request
            const abortController = new AbortController();
            lastCompletionRequest = abortController;
            
            const result = await window.ai.getInlineCompletion(text, {
                line: position.lineNumber - 1,
                column: position.column - 1,
                context: contextLines
            }, currentLanguage);
            
            // Check if request was aborted
            if (abortController.signal.aborted) return;
            
            if (result.success && result.completion) {
                // Cache the completion
                completionCache.set(cacheKey, result.completion);
                
                // Limit cache size
                if (completionCache.size > 50) {
                    const firstKey = completionCache.keys().next().value;
                    completionCache.delete(firstKey);
                }
                
                showInlineCompletion(result.completion, position);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Inline completion error:', error);
            }
        } finally {
            lastCompletionRequest = null;
        }
    }, 800); // Reduced delay for better responsiveness
}

function getContextLines(text, currentLine, contextSize) {
    const lines = text.split('\n');
    const start = Math.max(0, currentLine - contextSize);
    const end = Math.min(lines.length, currentLine + contextSize + 1);
    return lines.slice(start, end);
}

function showInlineCompletion(completion, position) {
    // Enhanced inline completion display
    if (!completion || completion.trim().length === 0) return;
    
    // Use Monaco's ghost text feature for better UX
    const model = editor.getModel();
    const range = new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
    );
    
    // Create ghost text decoration
    const decoration = {
        range: range,
        options: {
            after: {
                content: completion,
                inlineClassName: 'ghost-text',
                cursorStops: 'none'
            }
        }
    };
    
    // Remove previous decorations
    const decorations = editor.deltaDecorations([], [decoration]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        editor.deltaDecorations(decorations, []);
    }, 5000);
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

// AI Provider Modal functions
async function showAiProviderModal() {
    if (elements.aiProviderModal) {
        elements.aiProviderModal.classList.add('show');
        
        // Populate Ollama models when modal opens
        await populateOllamaModels();
    }
}

function hideAiProviderModal() {
    if (elements.aiProviderModal) {
        elements.aiProviderModal.classList.remove('show');
    }
}

async function populateOllamaModels() {
    try {
        const result = await window.ai.getAvailableModels('ollama');
        if (result.success && result.models && result.models.length > 0) {
            const modelSelect = document.getElementById('ollama-model');
            if (modelSelect) {
                // Clear existing options
                modelSelect.innerHTML = '';
                
                // Add models from Ollama
                result.models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.value;
                    option.textContent = model.label;
                    modelSelect.appendChild(option);
                });
                return; // Success, exit early
            }
        }
    } catch (error) {
        console.error('Failed to populate Ollama models:', error);
    }
    
    // Fallback: Use hardcoded options if Ollama is not available
    const modelSelect = document.getElementById('ollama-model');
    if (modelSelect) {
        modelSelect.innerHTML = `
            <option value="llama3.2:1b">llama3.2:1b (1.2GB)</option>
            <option value="codellama">CodeLlama (Recommended)</option>
            <option value="llama2">Llama2</option>
            <option value="mistral">Mistral</option>
            <option value="phi">Phi-2</option>
        `;
    }
}

function switchAiProviderTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}-tab`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

async function saveAiConfig() {
    try {
        // Get selected provider from radio buttons
        const selectedProvider = document.querySelector('input[name="ai-provider"]:checked');
        const providerType = selectedProvider ? selectedProvider.value : 'openai';
        
        let config = {};
        
        switch (providerType) {
            case 'openai':
                const openaiApiKey = elements.openaiApiKey.value;
                if (!openaiApiKey) {
                    showError('Please enter your OpenAI API key');
                    return;
                }
                config = { apiKey: openaiApiKey, model: 'gpt-4o-mini' };
                break;
            case 'ollama':
                const ollamaUrl = elements.ollamaUrl.value || 'http://localhost:11434';
                config = { baseUrl: ollamaUrl, model: 'codellama' };
                break;
        }
        
        showLoading(true);
        const result = await window.ai.initializeProvider(providerType, config);
        
        if (result.success) {
            apiKeySet = true;
            updateAiStatus();
            hideApiKeyNotice();
            hideAiProviderModal();
            showSuccess('AI provider configured successfully');
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Failed to configure AI provider: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function testAiConnection() {
    try {
        const activeTab = document.querySelector('.tab-btn.active');
        const providerType = activeTab ? activeTab.dataset.tab : 'openai';
        
        let config = {};
        
        switch (providerType) {
            case 'openai':
                const openaiApiKey = document.getElementById('openai-api-key').value;
                const openaiModel = document.getElementById('openai-model').value;
                config = { apiKey: openaiApiKey, model: openaiModel };
                break;
            case 'ollama':
                const ollamaUrl = document.getElementById('ollama-url').value;
                const ollamaModel = document.getElementById('ollama-model').value;
                config = { baseUrl: ollamaUrl, model: ollamaModel };
                break;
            case 'huggingface':
                const hfApiKey = document.getElementById('hf-api-key').value;
                const hfModel = document.getElementById('hf-model').value;
                config = { apiKey: hfApiKey, model: hfModel };
                break;
        }
        
        showLoading(true);
        const result = await window.ai.testConnection(providerType, config);
        
        if (result.success) {
            showSuccess('Connection test successful!');
        } else {
            showError('Connection test failed: ' + result.message);
        }
    } catch (error) {
        showError('Connection test failed: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Utility functions
function getFileName(path) {
    return path ? path.split(/[\\/]/).pop() : 'Untitled';
}

function getLanguageFromFile(path) {
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
    
    return languageMap[ext] || 'plaintext';
}

function loadDefaultContent() {
    return `// Welcome to Cursor Clone!
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

// Search and Replace functions
function toggleSearchBar() {
    if (elements.searchBar.classList.contains('hidden')) {
        showSearchBar();
    } else {
        hideSearchBar();
    }
}

function showSearchBar() {
    elements.searchBar.classList.remove('hidden');
    elements.searchInput.focus();
    elements.searchInput.select();
}

function hideSearchBar() {
    elements.searchBar.classList.add('hidden');
    elements.replaceContainer.classList.add('hidden');
    if (editor) {
        editor.getAction('editor.action.clearSearchResults').run();
    }
}

function handleSearchKeydown(e) {
    if (e.key === 'Enter') {
        if (e.shiftKey) {
            findPrevious();
        } else {
            findNext();
        }
    } else if (e.key === 'Escape') {
        hideSearchBar();
    }
}

function performSearch() {
    const searchTerm = elements.searchInput.value;
    if (!searchTerm || !editor) return;
    
    const options = {
        matchCase: document.getElementById('case-sensitive').checked,
        wholeWord: document.getElementById('whole-word').checked,
        regex: document.getElementById('regex').checked
    };
    
    editor.getModel().findMatches(searchTerm, false, options.regex, options.matchCase, null, true);
}

function findNext() {
    if (!editor) return;
    editor.getAction('editor.action.nextMatchFindAction').run();
}

function findPrevious() {
    if (!editor) return;
    editor.getAction('editor.action.previousMatchFindAction').run();
}

function toggleReplace() {
    if (elements.replaceContainer.classList.contains('hidden')) {
        elements.replaceContainer.classList.remove('hidden');
        elements.replaceInput.focus();
    } else {
        elements.replaceContainer.classList.add('hidden');
    }
}

function replaceAll() {
    if (!editor) return;
    
    const searchTerm = elements.searchInput.value;
    const replaceTerm = elements.replaceInput.value;
    
    if (!searchTerm) return;
    
    const options = {
        matchCase: document.getElementById('case-sensitive').checked,
        wholeWord: document.getElementById('whole-word').checked,
        regex: document.getElementById('regex').checked
    };
    
    const model = editor.getModel();
    const matches = model.findMatches(searchTerm, false, options.regex, options.matchCase, null, true);
    
    if (matches.length === 0) {
        showError('No matches found');
        return;
    }
    
    // Replace in reverse order to maintain positions
    matches.reverse().forEach(match => {
        model.pushEditOperations([], [{
            range: match.range,
            text: replaceTerm
        }]);
    });
    
    showSuccess(`Replaced ${matches.length} occurrence(s)`);
}

// Terminal functionality
let terminalHistory = [];
let terminalHistoryIndex = -1;
let lastCommand = '';

function toggleTerminalPanel() {
    if (elements.terminalPanel.classList.contains('visible')) {
        hideTerminalPanel();
    } else {
        showTerminalPanel();
    }
}

function showTerminalPanel() {
    elements.terminalPanel.classList.add('visible');
    elements.terminalInput.focus();
}

function hideTerminalPanel() {
    elements.terminalPanel.classList.remove('visible');
}

function handleTerminalKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendTerminalMessage();
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (terminalHistoryIndex > 0) {
            terminalHistoryIndex--;
            elements.terminalInput.value = terminalHistory[terminalHistoryIndex];
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (terminalHistoryIndex < terminalHistory.length - 1) {
            terminalHistoryIndex++;
            elements.terminalInput.value = terminalHistory[terminalHistoryIndex];
        } else if (terminalHistoryIndex === terminalHistory.length - 1) {
            terminalHistoryIndex = terminalHistory.length;
            elements.terminalInput.value = '';
        }
    }
}

function updateTerminalSendButton() {
    const hasText = elements.terminalInput.value.trim().length > 0;
    elements.sendTerminalBtn.disabled = !hasText;
}

async function sendTerminalMessage() {
    const message = elements.terminalInput.value.trim();
    if (!message) return;

    // Add to history
    terminalHistory.push(message);
    terminalHistoryIndex = terminalHistory.length;
    lastCommand = message;

    // Display user input
    addTerminalLine(`$ ${message}`, 'user');

    // Clear input
    elements.terminalInput.value = '';
    updateTerminalSendButton();

    try {
        // Get AI command suggestion
        const command = await window.terminal.generateCommandFromDescription(message);
        
        if (command && command !== message) {
            addTerminalLine(`AI suggests: ${command}`, 'ai');
            addTerminalLine('', '');
        }

        // Execute the command
        const result = await window.terminal.executeCommand(command || message);
        
        if (result.success) {
            if (result.output) {
                addTerminalLine(result.output, 'success');
            }
        } else {
            addTerminalLine(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        addTerminalLine(`Error: ${error.message}`, 'error');
    }

    // Scroll to bottom
    elements.terminalOutput.scrollTop = elements.terminalOutput.scrollHeight;
}

function addTerminalLine(text, type = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = text;
    elements.terminalOutput.appendChild(line);
}

function clearTerminal() {
    elements.terminalOutput.innerHTML = `
        <div class="terminal-welcome">
            <i class="fas fa-robot"></i>
            <h4>AI-Powered Terminal</h4>
            <p>Describe what you want to do in natural language, and I'll help you with the right commands!</p>
            <div class="terminal-examples">
                <h5>Examples:</h5>
                <ul>
                    <li>"List all files in this directory"</li>
                    <li>"Install the latest version of Node.js"</li>
                    <li>"Find all JavaScript files"</li>
                    <li>"Start the development server"</li>
                </ul>
            </div>
        </div>
    `;
}

async function getAiCommandSuggestions() {
    const message = elements.terminalInput.value.trim();
    if (!message) {
        showError('Please enter a description first');
        return;
    }

    try {
        const command = await window.terminal.generateCommandFromDescription(message);
        if (command) {
            elements.terminalInput.value = command;
            updateTerminalSendButton();
        }
    } catch (error) {
        showError(`Failed to get AI suggestion: ${error.message}`);
    }
}

async function executeLastCommand() {
    if (!lastCommand) {
        showError('No previous command to execute');
        return;
    }

    elements.terminalInput.value = lastCommand;
    updateTerminalSendButton();
    await sendTerminalMessage();
}

// Debug functionality
let debugIssues = [];
let debugSuggestions = [];
let debugLogs = [];

function toggleDebugPanel() {
    if (elements.debugPanel.classList.contains('visible')) {
        hideDebugPanel();
    } else {
        showDebugPanel();
    }
}

function showDebugPanel() {
    elements.debugPanel.classList.add('visible');
}

function hideDebugPanel() {
    elements.debugPanel.classList.remove('visible');
}

function switchDebugTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.debug-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.debug-tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab and panel
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`debug-${tabName}`).classList.add('active');
}

async function analyzeCurrentFile() {
    if (!editor) {
        showError('No file open to analyze');
        return;
    }

    const content = editor.getValue();
    const language = editor.getModel().getLanguageId();
    
    if (!content.trim()) {
        showError('File is empty');
        return;
    }

    try {
        showLoading(true);
        const result = await window.debug.analyzeCode(content, language);
        
        if (result.success) {
            debugIssues = result.issues || [];
            debugSuggestions = result.issues.filter(issue => issue.type === 'suggestion') || [];
            
            displayAnalysisResults(result);
            displayIssues();
            displaySuggestions();
            addDebugLog('Analysis completed', 'info', `Analyzed ${language} file with ${debugIssues.length} issues found`);
        } else {
            showError(`Analysis failed: ${result.error}`);
        }
    } catch (error) {
        showError(`Analysis error: ${error.message}`);
        addDebugLog(`Analysis error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function analyzeSelectedCode() {
    if (!editor) {
        showError('No editor available');
        return;
    }

    const selection = editor.getSelection();
    if (selection.isEmpty()) {
        showError('Please select some code to analyze');
        return;
    }

    const content = editor.getModel().getValueInRange(selection);
    const language = editor.getModel().getLanguageId();
    
    try {
        showLoading(true);
        const result = await window.debug.analyzeCode(content, language);
        
        if (result.success) {
            debugIssues = result.issues || [];
            debugSuggestions = result.issues.filter(issue => issue.type === 'suggestion') || [];
            
            displayAnalysisResults(result);
            displayIssues();
            displaySuggestions();
            addDebugLog('Selected code analysis completed', 'info', `Analyzed ${language} selection with ${debugIssues.length} issues found`);
        } else {
            showError(`Analysis failed: ${result.error}`);
        }
    } catch (error) {
        showError(`Analysis error: ${error.message}`);
        addDebugLog(`Analysis error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function displayAnalysisResults(result) {
    elements.analysisResults.classList.remove('hidden');
    
    const summary = result.summary || {
        totalIssues: debugIssues.length,
        errors: debugIssues.filter(i => i.severity === 'error').length,
        warnings: debugIssues.filter(i => i.severity === 'warning').length,
        suggestions: debugSuggestions.length
    };
    
    elements.summaryContent.innerHTML = `
        <div class="summary-stats">
            <div class="stat-item">
                <span class="stat-number">${summary.totalIssues}</span>
                <span class="stat-label">Total Issues</span>
            </div>
            <div class="stat-item">
                <span class="stat-number error">${summary.errors}</span>
                <span class="stat-label">Errors</span>
            </div>
            <div class="stat-item">
                <span class="stat-number warning">${summary.warnings}</span>
                <span class="stat-label">Warnings</span>
            </div>
            <div class="stat-item">
                <span class="stat-number info">${summary.suggestions}</span>
                <span class="stat-label">Suggestions</span>
            </div>
        </div>
    `;
}

function displayIssues() {
    if (debugIssues.length === 0) {
        elements.issuesList.innerHTML = `
            <div class="no-issues">
                <i class="fas fa-check-circle"></i>
                <p>No issues detected. Your code looks good!</p>
            </div>
        `;
        return;
    }

    const issuesHtml = debugIssues.map(issue => `
        <div class="issue-item">
            <div class="issue-header">
                <span class="issue-title">${issue.title || 'Issue'}</span>
                <span class="issue-severity ${issue.severity || 'info'}">${issue.severity || 'info'}</span>
            </div>
            <div class="issue-description">${issue.description || issue.message || 'No description available'}</div>
            ${issue.location ? `<div class="issue-location">${issue.location}</div>` : ''}
        </div>
    `).join('');

    elements.issuesList.innerHTML = issuesHtml;
}

function displaySuggestions() {
    if (debugSuggestions.length === 0) {
        elements.suggestionsList.innerHTML = `
            <div class="no-suggestions">
                <i class="fas fa-lightbulb"></i>
                <p>No AI suggestions available. Try analyzing your code first.</p>
            </div>
        `;
        return;
    }

    const suggestionsHtml = debugSuggestions.map(suggestion => `
        <div class="suggestion-item">
            <div class="suggestion-header">
                <span class="suggestion-title">${suggestion.title || 'Suggestion'}</span>
            </div>
            <div class="suggestion-description">${suggestion.description || suggestion.message || 'No description available'}</div>
            ${suggestion.location ? `<div class="suggestion-location">${suggestion.location}</div>` : ''}
        </div>
    `).join('');

    elements.suggestionsList.innerHTML = suggestionsHtml;
}

function clearIssues() {
    debugIssues = [];
    debugSuggestions = [];
    displayIssues();
    displaySuggestions();
    elements.analysisResults.classList.add('hidden');
    addDebugLog('Issues cleared', 'info');
}

function refreshSuggestions() {
    if (debugIssues.length === 0) {
        showError('No analysis data available. Please analyze your code first.');
        return;
    }
    
    // Re-analyze to get fresh suggestions
    analyzeCurrentFile();
}

function addDebugLog(message, type = 'info', details = '') {
    const timestamp = new Date().toLocaleTimeString();
    const log = {
        message,
        type,
        details,
        timestamp
    };
    
    debugLogs.unshift(log); // Add to beginning
    
    // Keep only last 100 logs
    if (debugLogs.length > 100) {
        debugLogs = debugLogs.slice(0, 100);
    }
    
    displayDebugLogs();
}

function displayDebugLogs() {
    if (debugLogs.length === 0) {
        elements.debugLogsList.innerHTML = `
            <div class="no-logs">
                <i class="fas fa-clipboard-list"></i>
                <p>No debug logs yet. Start debugging to see logs here.</p>
            </div>
        `;
        return;
    }

    const logsHtml = debugLogs.map(log => `
        <div class="log-item">
            <div class="log-header">
                <span class="log-title">${log.message}</span>
                <span class="log-timestamp">${log.timestamp}</span>
            </div>
            ${log.details ? `<div class="log-message">${log.details}</div>` : ''}
        </div>
    `).join('');

    elements.debugLogsList.innerHTML = logsHtml;
}

function clearDebugLogs() {
    debugLogs = [];
    displayDebugLogs();
}

function exportDebugLogs() {
    if (debugLogs.length === 0) {
        showError('No logs to export');
        return;
    }

    const logData = {
        timestamp: new Date().toISOString(),
        logs: debugLogs,
        issues: debugIssues,
        suggestions: debugSuggestions
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Debug logs exported successfully');
}

// Snippets functionality
let allSnippets = [];
let filteredSnippets = [];
let currentGeneratedSnippet = null;

function toggleSnippetsPanel() {
    if (elements.snippetsPanel.classList.contains('visible')) {
        hideSnippetsPanel();
    } else {
        showSnippetsPanel();
    }
}

function showSnippetsPanel() {
    elements.snippetsPanel.classList.add('visible');
    loadSnippets();
}

function hideSnippetsPanel() {
    elements.snippetsPanel.classList.remove('visible');
}

function switchSnippetsTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.snippets-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.snippets-tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab and panel
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`snippets-${tabName}`).classList.add('active');
}

async function loadSnippets() {
    try {
        elements.snippetsList.innerHTML = `
            <div class="snippets-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading snippets...</p>
            </div>
        `;

        const result = await window.snippets.getAll();
        if (result.success) {
            allSnippets = result.snippets || [];
            filteredSnippets = [...allSnippets];
            displaySnippets();
            updateCategoryFilter();
        } else {
            showError(`Failed to load snippets: ${result.error}`);
        }
    } catch (error) {
        showError(`Error loading snippets: ${error.message}`);
    }
}

function displaySnippets() {
    if (filteredSnippets.length === 0) {
        elements.snippetsList.innerHTML = `
            <div class="snippets-loading">
                <i class="fas fa-code"></i>
                <p>No snippets found. Create your first snippet!</p>
            </div>
        `;
        return;
    }

    const snippetsHtml = filteredSnippets.map(snippet => `
        <div class="snippet-item" data-snippet-id="${snippet.id}">
            <div class="snippet-header">
                <span class="snippet-name">${snippet.name}</span>
                <span class="snippet-language">${snippet.language}</span>
            </div>
            <div class="snippet-description">${snippet.description || 'No description'}</div>
            <div class="snippet-meta">
                <span class="snippet-category">${snippet.category || 'Uncategorized'}</span>
                <div class="snippet-actions">
                    <button class="snippet-action-btn" onclick="useSnippet('${snippet.id}')" title="Use snippet">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="snippet-action-btn" onclick="editSnippet('${snippet.id}')" title="Edit snippet">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="snippet-action-btn" onclick="deleteSnippet('${snippet.id}')" title="Delete snippet">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    elements.snippetsList.innerHTML = snippetsHtml;
}

function updateCategoryFilter() {
    const categories = [...new Set(allSnippets.map(s => s.category).filter(Boolean))];
    const categoryFilter = elements.snippetsCategoryFilter;
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function filterSnippets() {
    const searchTerm = elements.snippetsSearchInput.value.toLowerCase();
    const languageFilter = elements.snippetsLanguageFilter.value;
    const categoryFilter = elements.snippetsCategoryFilter.value;

    filteredSnippets = allSnippets.filter(snippet => {
        const matchesSearch = !searchTerm || 
            snippet.name.toLowerCase().includes(searchTerm) ||
            snippet.description.toLowerCase().includes(searchTerm) ||
            snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesLanguage = !languageFilter || snippet.language === languageFilter;
        const matchesCategory = !categoryFilter || snippet.category === categoryFilter;

        return matchesSearch && matchesLanguage && matchesCategory;
    });

    displaySnippets();
}

async function saveSnippet() {
    const snippetData = {
        name: elements.snippetName.value.trim(),
        description: elements.snippetDescription.value.trim(),
        language: elements.snippetLanguage.value,
        category: elements.snippetCategory.value.trim(),
        code: elements.snippetCode.value.trim(),
        tags: elements.snippetTags.value.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    if (!snippetData.name || !snippetData.code) {
        showError('Name and code are required');
        return;
    }

    try {
        showLoading(true);
        const result = await window.snippets.create(snippetData);
        
        if (result.success) {
            showSuccess('Snippet saved successfully');
            clearSnippetForm();
            loadSnippets();
        } else {
            showError(`Failed to save snippet: ${result.error}`);
        }
    } catch (error) {
        showError(`Error saving snippet: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function clearSnippetForm() {
    elements.snippetName.value = '';
    elements.snippetDescription.value = '';
    elements.snippetLanguage.value = 'javascript';
    elements.snippetCategory.value = '';
    elements.snippetCode.value = '';
    elements.snippetTags.value = '';
}

async function generateAISnippet() {
    const description = elements.aiSnippetDescription.value.trim();
    const language = elements.aiSnippetLanguage.value;
    const category = elements.aiSnippetCategory.value.trim() || 'AI Generated';

    if (!description) {
        showError('Please enter a description for the snippet');
        return;
    }

    try {
        showLoading(true);
        const result = await window.snippets.generateSnippetFromAI(description, language, category);
        
        if (result.success) {
            currentGeneratedSnippet = result.snippet;
            displayGeneratedSnippet(result.snippet);
            showSuccess('Snippet generated successfully');
        } else {
            showError(`Failed to generate snippet: ${result.error}`);
        }
    } catch (error) {
        showError(`Error generating snippet: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function displayGeneratedSnippet(snippet) {
    elements.aiGeneratedSnippet.classList.remove('hidden');
    document.querySelector('.snippet-name-preview').textContent = snippet.name;
    document.querySelector('.snippet-code-preview').textContent = snippet.code;
}

async function useGeneratedSnippet() {
    if (!currentGeneratedSnippet) {
        showError('No generated snippet to use');
        return;
    }

    try {
        const result = await window.snippets.create(currentGeneratedSnippet);
        
        if (result.success) {
            showSuccess('Generated snippet saved to library');
            elements.aiGeneratedSnippet.classList.add('hidden');
            elements.aiSnippetDescription.value = '';
            elements.aiSnippetCategory.value = '';
            currentGeneratedSnippet = null;
            loadSnippets();
        } else {
            showError(`Failed to save generated snippet: ${result.error}`);
        }
    } catch (error) {
        showError(`Error saving generated snippet: ${error.message}`);
    }
}

async function useSnippet(snippetId) {
    const snippet = allSnippets.find(s => s.id === snippetId);
    if (!snippet) return;

    if (editor) {
        const selection = editor.getSelection();
        if (!selection.isEmpty()) {
            // Replace selected text
            editor.executeEdits('snippet-insert', [{
                range: selection,
                text: snippet.code
            }]);
        } else {
            // Insert at cursor position
            const position = editor.getPosition();
            editor.executeEdits('snippet-insert', [{
                range: { startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: position.lineNumber, endColumn: position.column },
                text: snippet.code
            }]);
        }
        showSuccess(`Snippet "${snippet.name}" inserted`);
    } else {
        showError('No editor available');
    }
}

function editSnippet(snippetId) {
    const snippet = allSnippets.find(s => s.id === snippetId);
    if (!snippet) return;

    // Switch to create tab and populate form
    switchSnippetsTab('create');
    elements.snippetName.value = snippet.name;
    elements.snippetDescription.value = snippet.description || '';
    elements.snippetLanguage.value = snippet.language;
    elements.snippetCategory.value = snippet.category || '';
    elements.snippetCode.value = snippet.code;
    elements.snippetTags.value = snippet.tags.join(', ');
}

async function deleteSnippet(snippetId) {
    if (!confirm('Are you sure you want to delete this snippet?')) return;

    try {
        const result = await window.snippets.delete(snippetId);
        
        if (result.success) {
            showSuccess('Snippet deleted successfully');
            loadSnippets();
        } else {
            showError(`Failed to delete snippet: ${result.error}`);
        }
    } catch (error) {
        showError(`Error deleting snippet: ${error.message}`);
    }
}

// Analytics functionality
function toggleAnalyticsPanel() {
    if (elements.analyticsPanel.classList.contains('visible')) {
        hideAnalyticsPanel();
    } else {
        showAnalyticsPanel();
    }
}

function showAnalyticsPanel() {
    elements.analyticsPanel.classList.add('visible');
    loadAnalytics();
}

function hideAnalyticsPanel() {
    elements.analyticsPanel.classList.remove('visible');
}

function switchAnalyticsTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.analytics-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.analytics-tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab and panel
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`analytics-${tabName}`).classList.add('active');
}

async function loadAnalytics() {
    try {
        // Load analytics data from database
        const result = await window.database.getAnalytics();
        if (result.success) {
            updateAnalyticsDisplay(result.analytics);
        } else {
            // Use mock data for demonstration
            updateAnalyticsDisplay(getMockAnalytics());
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        updateAnalyticsDisplay(getMockAnalytics());
    }
}

function getMockAnalytics() {
    return {
        totalAIRequests: 156,
        avgResponseTime: 1200,
        linesGenerated: 2847,
        issuesFound: 23,
        providerUsage: {
            'OpenAI': 45,
            'Ollama': 32,
            'HuggingFace': 23
        },
        featureUsage: {
            'Code Completion': 89,
            'Chat Assistant': 45,
            'Code Refactoring': 12,
            'Debug Analysis': 10
        },
        performance: {
            memoryUsage: 245,
            cpuUsage: 15,
            sessionDuration: 45
        }
    };
}

function updateAnalyticsDisplay(analytics) {
    // Update overview stats
    document.getElementById('total-ai-requests').textContent = analytics.totalAIRequests || 0;
    document.getElementById('avg-response-time').textContent = `${analytics.avgResponseTime || 0}ms`;
    document.getElementById('lines-generated').textContent = analytics.linesGenerated || 0;
    document.getElementById('issues-found').textContent = analytics.issuesFound || 0;

    // Update performance metrics
    document.getElementById('memory-usage').textContent = `${analytics.performance?.memoryUsage || 0} MB`;
    document.getElementById('cpu-usage').textContent = `${analytics.performance?.cpuUsage || 0}%`;
    document.getElementById('session-duration').textContent = `${analytics.performance?.sessionDuration || 0}m`;

    // Update feature usage
    if (analytics.featureUsage) {
        Object.entries(analytics.featureUsage).forEach(([feature, count]) => {
            const featureItem = document.querySelector(`[data-feature="${feature}"]`);
            if (featureItem) {
                featureItem.querySelector('.feature-count').textContent = count;
            }
        });
    }
}

async function refreshAnalytics() {
    showLoading(true);
    try {
        await loadAnalytics();
        showSuccess('Analytics data refreshed');
    } catch (error) {
        showError('Failed to refresh analytics data');
    } finally {
        showLoading(false);
    }
}

function exportAnalytics() {
    try {
        const analyticsData = {
            timestamp: new Date().toISOString(),
            data: getMockAnalytics()
        };

        const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess('Analytics report exported successfully');
    } catch (error) {
        showError('Failed to export analytics report');
    }
}

// Drag and Drop functionality
function setupDragAndDrop() {
    const editorArea = document.getElementById('editor-area');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        editorArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        editorArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        editorArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    editorArea.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    e.currentTarget.classList.add('drag-over');
}

function unhighlight(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const file = files[0];
        openFileFromPath(file.path);
    }
}

// Recent files functionality
function addToRecentFiles(filePath) {
    if (!filePath) return;
    
    // Remove if already exists
    recentFiles = recentFiles.filter(path => path !== filePath);
    
    // Add to beginning
    recentFiles.unshift(filePath);
    
    // Limit to 10 recent files
    if (recentFiles.length > 10) {
        recentFiles = recentFiles.slice(0, 10);
    }
    
    // Save to localStorage
    localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
    
    updateRecentFilesDisplay();
}

function loadRecentFiles() {
    const saved = localStorage.getItem('recentFiles');
    if (saved) {
        recentFiles = JSON.parse(saved);
        updateRecentFilesDisplay();
    }
}

function updateRecentFilesDisplay() {
    const fileTree = elements.fileTree;
    if (!fileTree) return;
    
    // Add recent files section if not exists
    let recentSection = fileTree.querySelector('.recent-files-section');
    if (!recentSection && recentFiles.length > 0) {
        recentSection = document.createElement('div');
        recentSection.className = 'recent-files-section';
        recentSection.innerHTML = `
            <div class="file-tree-header">
                <i class="fas fa-clock"></i>
                <span>Recent Files</span>
            </div>
            <div class="recent-files-list"></div>
        `;
        fileTree.insertBefore(recentSection, fileTree.firstChild);
    }
    
    if (recentSection && recentFiles.length > 0) {
        const recentList = recentSection.querySelector('.recent-files-list');
        recentList.innerHTML = recentFiles.map(filePath => {
            const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
            return `
                <div class="file-tree-item recent-file" data-path="${filePath}">
                    <i class="fas fa-file"></i>
                    <span title="${filePath}">${fileName}</span>
                </div>
            `;
        }).join('');
        
        // Add click handlers for recent files
        recentList.querySelectorAll('.recent-file').forEach(item => {
            item.addEventListener('click', () => {
                const filePath = item.dataset.path;
                openFileFromPath(filePath);
            });
        });
    }
}

// Enhanced file opening with recent files tracking
async function openFileFromPath(filePath) {
    try {
        const result = await window.electronAPI.openFileFromPath({ filePath });
        if (result.success) {
            const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
            const language = getLanguageFromExtension(fileName);
            
            // Add to recent files
            addToRecentFiles(filePath);
            
            // Open in editor
            openFileInEditor(fileName, result.content, language, filePath);
        } else {
            showError('Failed to open file: ' + result.error);
        }
    } catch (error) {
        showError('Error opening file: ' + error.message);
    }
}

function getLanguageFromExtension(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
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
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
        'cpp': 'cpp',
        'c': 'c',
        'h': 'c',
        'hpp': 'cpp',
        'java': 'java',
        'cs': 'csharp',
        'swift': 'swift',
        'kt': 'kotlin',
        'scala': 'scala',
        'sh': 'shell',
        'bash': 'shell',
        'ps1': 'powershell',
        'yaml': 'yaml',
        'yml': 'yaml',
        'toml': 'toml',
        'ini': 'ini',
        'cfg': 'ini',
        'conf': 'ini'
    };
    return languageMap[extension] || 'plaintext';
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    loadRecentFiles(); // Load recent files on startup
});

// Handle window resize
window.addEventListener('resize', () => {
    if (editor) {
        editor.layout();
    }
});
