const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class SnippetsService {
  constructor() {
    this.snippetsDirectory = path.join(os.homedir(), '.cursor-clone', 'snippets');
    this.snippets = new Map();
    this.categories = new Set();
    this.initialize();
  }

  /**
   * Initialize snippets service
   */
  async initialize() {
    try {
      await this.ensureSnippetsDirectory();
      await this.loadSnippets();
    } catch (error) {
      console.error('Failed to initialize snippets service:', error);
    }
  }

  /**
   * Ensure snippets directory exists
   */
  async ensureSnippetsDirectory() {
    try {
      await fs.access(this.snippetsDirectory);
    } catch (error) {
      await fs.mkdir(this.snippetsDirectory, { recursive: true });
    }
  }

  /**
   * Load all snippets from disk
   */
  async loadSnippets() {
    try {
      const files = await fs.readdir(this.snippetsDirectory);
      const snippetFiles = files.filter(file => file.endsWith('.json'));

      for (const file of snippetFiles) {
        try {
          const filePath = path.join(this.snippetsDirectory, file);
          const content = await fs.readFile(filePath, 'utf8');
          const snippet = JSON.parse(content);
          
          this.snippets.set(snippet.id, snippet);
          this.categories.add(snippet.category);
        } catch (error) {
          console.error(`Failed to load snippet ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to load snippets:', error);
    }
  }

  /**
   * Create a new snippet
   * @param {Object} snippetData - Snippet data
   */
  async createSnippet(snippetData) {
    const snippet = {
      id: this.generateId(),
      name: snippetData.name,
      description: snippetData.description,
      code: snippetData.code,
      language: snippetData.language,
      category: snippetData.category || 'General',
      tags: snippetData.tags || [],
      variables: snippetData.variables || [],
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      usage: 0
    };

    try {
      const filePath = path.join(this.snippetsDirectory, `${snippet.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(snippet, null, 2));
      
      this.snippets.set(snippet.id, snippet);
      this.categories.add(snippet.category);
      
      return { success: true, snippet };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing snippet
   * @param {string} id - Snippet ID
   * @param {Object} updates - Updates to apply
   */
  async updateSnippet(id, updates) {
    const snippet = this.snippets.get(id);
    if (!snippet) {
      return { success: false, error: 'Snippet not found' };
    }

    const updatedSnippet = {
      ...snippet,
      ...updates,
      modified: new Date().toISOString()
    };

    try {
      const filePath = path.join(this.snippetsDirectory, `${id}.json`);
      await fs.writeFile(filePath, JSON.stringify(updatedSnippet, null, 2));
      
      this.snippets.set(id, updatedSnippet);
      if (updates.category) {
        this.categories.add(updates.category);
      }
      
      return { success: true, snippet: updatedSnippet };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a snippet
   * @param {string} id - Snippet ID
   */
  async deleteSnippet(id) {
    const snippet = this.snippets.get(id);
    if (!snippet) {
      return { success: false, error: 'Snippet not found' };
    }

    try {
      const filePath = path.join(this.snippetsDirectory, `${id}.json`);
      await fs.unlink(filePath);
      
      this.snippets.delete(id);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get snippet by ID
   * @param {string} id - Snippet ID
   */
  getSnippet(id) {
    const snippet = this.snippets.get(id);
    if (snippet) {
      // Increment usage count
      snippet.usage++;
      this.updateSnippet(id, { usage: snippet.usage });
    }
    return snippet;
  }

  /**
   * Get all snippets
   */
  getAllSnippets() {
    return Array.from(this.snippets.values());
  }

  /**
   * Get snippets by category
   * @param {string} category - Category name
   */
  getSnippetsByCategory(category) {
    return Array.from(this.snippets.values()).filter(snippet => snippet.category === category);
  }

  /**
   * Get snippets by language
   * @param {string} language - Programming language
   */
  getSnippetsByLanguage(language) {
    return Array.from(this.snippets.values()).filter(snippet => snippet.language === language);
  }

  /**
   * Search snippets
   * @param {string} query - Search query
   */
  searchSnippets(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.snippets.values()).filter(snippet => 
      snippet.name.toLowerCase().includes(lowerQuery) ||
      snippet.description.toLowerCase().includes(lowerQuery) ||
      snippet.code.toLowerCase().includes(lowerQuery) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get popular snippets (most used)
   * @param {number} limit - Number of snippets to return
   */
  getPopularSnippets(limit = 10) {
    return Array.from(this.snippets.values())
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories);
  }

  /**
   * Generate snippet from AI description
   * @param {string} description - Natural language description
   * @param {string} language - Programming language
   * @param {string} category - Category
   */
  async generateSnippetFromAI(description, language, category = 'AI Generated') {
    // This would typically use AI to generate the snippet
    // For now, we'll create a placeholder snippet
    const snippetData = {
      name: `AI Generated: ${description.substring(0, 50)}...`,
      description: description,
      code: `// TODO: AI will generate code for: ${description}`,
      language: language,
      category: category,
      tags: ['ai-generated', language.toLowerCase()]
    };

    return await this.createSnippet(snippetData);
  }

  /**
   * Process snippet variables
   * @param {string} code - Snippet code with variables
   * @param {Object} variables - Variable values
   */
  processSnippetVariables(code, variables = {}) {
    let processedCode = code;
    
    // Replace variables in the format ${variableName}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      processedCode = processedCode.replace(regex, value);
    }
    
    return processedCode;
  }

  /**
   * Extract variables from snippet code
   * @param {string} code - Snippet code
   */
  extractVariables(code) {
    const variableRegex = /\$\{([^}]+)\}/g;
    const variables = new Set();
    let match;
    
    while ((match = variableRegex.exec(code)) !== null) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  }

  /**
   * Import snippets from file
   * @param {string} filePath - Path to import file
   */
  async importSnippets(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const snippets = JSON.parse(content);
      
      const results = [];
      for (const snippetData of snippets) {
        const result = await this.createSnippet(snippetData);
        results.push(result);
      }
      
      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Export snippets to file
   * @param {string} filePath - Path to export file
   * @param {Array} snippetIds - IDs of snippets to export (optional)
   */
  async exportSnippets(filePath, snippetIds = null) {
    try {
      let snippetsToExport;
      
      if (snippetIds) {
        snippetsToExport = snippetIds.map(id => this.snippets.get(id)).filter(Boolean);
      } else {
        snippetsToExport = Array.from(this.snippets.values());
      }
      
      await fs.writeFile(filePath, JSON.stringify(snippetsToExport, null, 2));
      return { success: true, count: snippetsToExport.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get snippet statistics
   */
  getStatistics() {
    const snippets = Array.from(this.snippets.values());
    
    const stats = {
      total: snippets.length,
      categories: this.categories.size,
      languages: new Set(snippets.map(s => s.language)).size,
      totalUsage: snippets.reduce((sum, s) => sum + s.usage, 0),
      averageUsage: snippets.length > 0 ? snippets.reduce((sum, s) => sum + s.usage, 0) / snippets.length : 0,
      mostUsedLanguage: this.getMostUsedLanguage(),
      mostUsedCategory: this.getMostUsedCategory()
    };
    
    return stats;
  }

  /**
   * Get most used language
   */
  getMostUsedLanguage() {
    const languageUsage = {};
    
    for (const snippet of this.snippets.values()) {
      languageUsage[snippet.language] = (languageUsage[snippet.language] || 0) + snippet.usage;
    }
    
    return Object.entries(languageUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
  }

  /**
   * Get most used category
   */
  getMostUsedCategory() {
    const categoryUsage = {};
    
    for (const snippet of this.snippets.values()) {
      categoryUsage[snippet.category] = (categoryUsage[snippet.category] || 0) + snippet.usage;
    }
    
    return Object.entries(categoryUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get default snippets for common use cases
   */
  getDefaultSnippets() {
    return [
      {
        name: 'React Component',
        description: 'Basic React functional component',
        code: `import React from 'react';

const ${1:ComponentName} = () => {
  return (
    <div>
      ${2:Content}
    </div>
  );
};

export default ${1:ComponentName};`,
        language: 'javascript',
        category: 'React',
        tags: ['react', 'component', 'jsx']
      },
      {
        name: 'Async Function',
        description: 'JavaScript async function with error handling',
        code: `const ${1:functionName} = async (${2:params}) => {
  try {
    ${3:// Your async code here}
    return ${4:result};
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};`,
        language: 'javascript',
        category: 'JavaScript',
        tags: ['async', 'function', 'error-handling']
      },
      {
        name: 'Python Class',
        description: 'Basic Python class with constructor',
        code: `class ${1:ClassName}:
    def __init__(self, ${2:params}):
        ${3:self.param = param}
    
    def ${4:method_name}(self):
        ${5:pass}`,
        language: 'python',
        category: 'Python',
        tags: ['class', 'constructor', 'method']
      }
    ];
  }
}

module.exports = { SnippetsService };
