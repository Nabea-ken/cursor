const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the database
   */
  async initialize() {
    try {
      // Create database directory
      const dbDir = path.join(os.homedir(), '.cursor-clone');
      await fs.mkdir(dbDir, { recursive: true });
      
      this.dbPath = path.join(dbDir, 'cursor-clone.db');
      
      // Initialize database
      await this.createDatabase();
      await this.createTables();
      
      this.isInitialized = true;
      console.log('Database initialized successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Database initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create database connection
   */
  createDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Create database tables
   */
  async createTables() {
    const tables = [
      // User preferences table
      `CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // AI interactions history
      `CREATE TABLE IF NOT EXISTS ai_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        prompt TEXT,
        response TEXT,
        model TEXT,
        provider TEXT,
        tokens_used INTEGER,
        duration_ms INTEGER,
        success BOOLEAN,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Project settings
      `CREATE TABLE IF NOT EXISTS project_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_path TEXT UNIQUE NOT NULL,
        ai_provider TEXT,
        ai_model TEXT,
        theme TEXT,
        font_size INTEGER,
        auto_save BOOLEAN,
        git_integration BOOLEAN,
        terminal_enabled BOOLEAN,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Code snippets (enhanced with database storage)
      `CREATE TABLE IF NOT EXISTS code_snippets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        code TEXT NOT NULL,
        language TEXT,
        category TEXT,
        tags TEXT,
        usage_count INTEGER DEFAULT 0,
        is_favorite BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Git history
      `CREATE TABLE IF NOT EXISTS git_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_path TEXT NOT NULL,
        commit_hash TEXT,
        commit_message TEXT,
        author TEXT,
        date DATETIME,
        files_changed TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Terminal commands history
      `CREATE TABLE IF NOT EXISTS terminal_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        command TEXT NOT NULL,
        output TEXT,
        exit_code INTEGER,
        duration_ms INTEGER,
        session_id TEXT,
        success BOOLEAN,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // File operations history
      `CREATE TABLE IF NOT EXISTS file_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL,
        operation TEXT NOT NULL,
        content_hash TEXT,
        file_size INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // AI learning patterns
      `CREATE TABLE IF NOT EXISTS ai_patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern_type TEXT NOT NULL,
        pattern_data TEXT,
        frequency INTEGER DEFAULT 1,
        last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await this.runQuery(table);
    }
  }

  /**
   * Run a database query
   */
  runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Get a single row
   */
  getRow(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Get multiple rows
   */
  getAll(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * User Preferences Management
   */
  async setPreference(key, value) {
    const sql = `
      INSERT OR REPLACE INTO user_preferences (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `;
    return await this.runQuery(sql, [key, JSON.stringify(value)]);
  }

  async getPreference(key, defaultValue = null) {
    const row = await this.getRow(
      'SELECT value FROM user_preferences WHERE key = ?',
      [key]
    );
    
    if (row) {
      try {
        return JSON.parse(row.value);
      } catch {
        return row.value;
      }
    }
    return defaultValue;
  }

  async getAllPreferences() {
    const rows = await this.getAll('SELECT key, value FROM user_preferences');
    const preferences = {};
    
    for (const row of rows) {
      try {
        preferences[row.key] = JSON.parse(row.value);
      } catch {
        preferences[row.key] = row.value;
      }
    }
    
    return preferences;
  }

  /**
   * AI Interactions History
   */
  async logAIInteraction(interaction) {
    const sql = `
      INSERT INTO ai_interactions 
      (type, prompt, response, model, provider, tokens_used, duration_ms, success, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return await this.runQuery(sql, [
      interaction.type,
      interaction.prompt,
      interaction.response,
      interaction.model,
      interaction.provider,
      interaction.tokens_used,
      interaction.duration_ms,
      interaction.success,
      interaction.error_message
    ]);
  }

  async getAIInteractions(limit = 50, offset = 0) {
    const sql = `
      SELECT * FROM ai_interactions 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    return await this.getAll(sql, [limit, offset]);
  }

  async getAIStats() {
    const stats = await this.getAll(`
      SELECT 
        COUNT(*) as total_interactions,
        COUNT(CASE WHEN success = 1 THEN 1 END) as successful_interactions,
        AVG(duration_ms) as avg_duration,
        SUM(tokens_used) as total_tokens,
        provider,
        model
      FROM ai_interactions 
      GROUP BY provider, model
    `);
    
    return stats;
  }

  /**
   * Project Settings Management
   */
  async setProjectSettings(projectPath, settings) {
    const sql = `
      INSERT OR REPLACE INTO project_settings 
      (project_path, ai_provider, ai_model, theme, font_size, auto_save, git_integration, terminal_enabled, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    return await this.runQuery(sql, [
      projectPath,
      settings.ai_provider,
      settings.ai_model,
      settings.theme,
      settings.font_size,
      settings.auto_save,
      settings.git_integration,
      settings.terminal_enabled
    ]);
  }

  async getProjectSettings(projectPath) {
    return await this.getRow(
      'SELECT * FROM project_settings WHERE project_path = ?',
      [projectPath]
    );
  }

  async getAllProjectSettings() {
    return await this.getAll('SELECT * FROM project_settings ORDER BY updated_at DESC');
  }

  /**
   * Enhanced Code Snippets
   */
  async saveSnippet(snippet) {
    const sql = `
      INSERT INTO code_snippets 
      (name, description, code, language, category, tags, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    return await this.runQuery(sql, [
      snippet.name,
      snippet.description,
      snippet.code,
      snippet.language,
      snippet.category,
      JSON.stringify(snippet.tags || []),
      snippet.is_favorite || false
    ]);
  }

  async updateSnippet(id, updates) {
    const sql = `
      UPDATE code_snippets 
      SET name = ?, description = ?, code = ?, language = ?, category = ?, tags = ?, is_favorite = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    return await this.runQuery(sql, [
      updates.name,
      updates.description,
      updates.code,
      updates.language,
      updates.category,
      JSON.stringify(updates.tags || []),
      updates.is_favorite,
      id
    ]);
  }

  async getSnippet(id) {
    const snippet = await this.getRow(
      'SELECT * FROM code_snippets WHERE id = ?',
      [id]
    );
    
    if (snippet) {
      // Increment usage count
      await this.runQuery(
        'UPDATE code_snippets SET usage_count = usage_count + 1 WHERE id = ?',
        [id]
      );
      
      // Parse tags
      try {
        snippet.tags = JSON.parse(snippet.tags);
      } catch {
        snippet.tags = [];
      }
    }
    
    return snippet;
  }

  async searchSnippets(query, language = null, category = null) {
    let sql = `
      SELECT * FROM code_snippets 
      WHERE (name LIKE ? OR description LIKE ? OR code LIKE ?)
    `;
    const params = [`%${query}%`, `%${query}%`, `%${query}%`];
    
    if (language) {
      sql += ' AND language = ?';
      params.push(language);
    }
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY usage_count DESC, updated_at DESC';
    
    const snippets = await this.getAll(sql, params);
    
    // Parse tags for each snippet
    for (const snippet of snippets) {
      try {
        snippet.tags = JSON.parse(snippet.tags);
      } catch {
        snippet.tags = [];
      }
    }
    
    return snippets;
  }

  async getPopularSnippets(limit = 10) {
    return await this.getAll(
      'SELECT * FROM code_snippets ORDER BY usage_count DESC LIMIT ?',
      [limit]
    );
  }

  async getFavoriteSnippets() {
    return await this.getAll(
      'SELECT * FROM code_snippets WHERE is_favorite = 1 ORDER BY updated_at DESC'
    );
  }

  /**
   * Git History
   */
  async logGitCommit(commit) {
    const sql = `
      INSERT INTO git_history 
      (project_path, commit_hash, commit_message, author, date, files_changed)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    return await this.runQuery(sql, [
      commit.project_path,
      commit.commit_hash,
      commit.commit_message,
      commit.author,
      commit.date,
      JSON.stringify(commit.files_changed)
    ]);
  }

  async getGitHistory(projectPath, limit = 20) {
    const commits = await this.getAll(
      'SELECT * FROM git_history WHERE project_path = ? ORDER BY date DESC LIMIT ?',
      [projectPath, limit]
    );
    
    // Parse files_changed for each commit
    for (const commit of commits) {
      try {
        commit.files_changed = JSON.parse(commit.files_changed);
      } catch {
        commit.files_changed = [];
      }
    }
    
    return commits;
  }

  /**
   * Terminal History
   */
  async logTerminalCommand(command) {
    const sql = `
      INSERT INTO terminal_history 
      (command, output, exit_code, duration_ms, session_id, success)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    return await this.runQuery(sql, [
      command.command,
      command.output,
      command.exit_code,
      command.duration_ms,
      command.session_id,
      command.success
    ]);
  }

  async getTerminalHistory(limit = 50) {
    return await this.getAll(
      'SELECT * FROM terminal_history ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
  }

  async getCommonCommands(limit = 10) {
    return await this.getAll(`
      SELECT command, COUNT(*) as usage_count, AVG(duration_ms) as avg_duration
      FROM terminal_history 
      WHERE success = 1
      GROUP BY command 
      ORDER BY usage_count DESC 
      LIMIT ?
    `, [limit]);
  }

  /**
   * File History
   */
  async logFileOperation(operation) {
    const sql = `
      INSERT INTO file_history 
      (file_path, operation, content_hash, file_size)
      VALUES (?, ?, ?, ?)
    `;
    
    return await this.runQuery(sql, [
      operation.file_path,
      operation.operation,
      operation.content_hash,
      operation.file_size
    ]);
  }

  async getFileHistory(filePath, limit = 20) {
    return await this.getAll(
      'SELECT * FROM file_history WHERE file_path = ? ORDER BY created_at DESC LIMIT ?',
      [filePath, limit]
    );
  }

  /**
   * AI Learning Patterns
   */
  async logAIPattern(pattern) {
    const sql = `
      INSERT OR REPLACE INTO ai_patterns 
      (pattern_type, pattern_data, frequency, last_used)
      VALUES (?, ?, COALESCE((SELECT frequency + 1 FROM ai_patterns WHERE pattern_type = ? AND pattern_data = ?), 1), CURRENT_TIMESTAMP)
    `;
    
    return await this.runQuery(sql, [
      pattern.type,
      JSON.stringify(pattern.data),
      pattern.type,
      JSON.stringify(pattern.data)
    ]);
  }

  async getAIPatterns(patternType, limit = 10) {
    return await this.getAll(
      'SELECT * FROM ai_patterns WHERE pattern_type = ? ORDER BY frequency DESC, last_used DESC LIMIT ?',
      [patternType, limit]
    );
  }

  /**
   * Analytics and Statistics
   */
  async getAnalytics() {
    const analytics = {};
    
    // AI usage analytics
    analytics.ai = await this.getAIStats();
    
    // Most used snippets
    analytics.popularSnippets = await this.getPopularSnippets(5);
    
    // Common terminal commands
    analytics.commonCommands = await this.getCommonCommands(5);
    
    // Recent projects
    analytics.recentProjects = await this.getAll(
      'SELECT project_path, updated_at FROM project_settings ORDER BY updated_at DESC LIMIT 5'
    );
    
    // Daily activity
    analytics.dailyActivity = await this.getAll(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as interactions,
        COUNT(CASE WHEN success = 1 THEN 1 END) as successful
      FROM ai_interactions 
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    return analytics;
  }

  /**
   * Database maintenance
   */
  async cleanup() {
    // Clean old AI interactions (keep last 1000)
    await this.runQuery(`
      DELETE FROM ai_interactions 
      WHERE id NOT IN (
        SELECT id FROM ai_interactions 
        ORDER BY created_at DESC 
        LIMIT 1000
      )
    `);
    
    // Clean old terminal history (keep last 500)
    await this.runQuery(`
      DELETE FROM terminal_history 
      WHERE id NOT IN (
        SELECT id FROM terminal_history 
        ORDER BY created_at DESC 
        LIMIT 500
      )
    `);
    
    // Clean old file history (keep last 200)
    await this.runQuery(`
      DELETE FROM file_history 
      WHERE id NOT IN (
        SELECT id FROM file_history 
        ORDER BY created_at DESC 
        LIMIT 200
      )
    `);
    
    return { success: true };
  }

  /**
   * Export database
   */
  async exportData() {
    const data = {
      preferences: await this.getAllPreferences(),
      snippets: await this.getAll('SELECT * FROM code_snippets'),
      projectSettings: await this.getAllProjectSettings(),
      aiInteractions: await this.getAIInteractions(1000, 0),
      gitHistory: await this.getAll('SELECT * FROM git_history ORDER BY date DESC LIMIT 100'),
      terminalHistory: await this.getTerminalHistory(100),
      analytics: await this.getAnalytics()
    };
    
    return data;
  }

  /**
   * Close database connection
   */
  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          }
          this.isInitialized = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = { DatabaseService };
