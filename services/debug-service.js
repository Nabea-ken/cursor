const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class DebugService {
  constructor() {
    this.debugSessions = new Map();
    this.breakpoints = new Map();
    this.logs = [];
  }

  /**
   * Analyze code for potential issues
   * @param {string} code - Code to analyze
   * @param {string} language - Programming language
   */
  async analyzeCode(code, language) {
    const issues = [];
    
    // Basic syntax and common issues detection
    const analysis = await this.performStaticAnalysis(code, language);
    issues.push(...analysis.issues);

    // AI-powered analysis suggestions
    const aiSuggestions = await this.getAIDebugSuggestions(code, language);
    issues.push(...aiSuggestions);

    return {
      success: true,
      issues: issues,
      summary: this.generateSummary(issues)
    };
  }

  /**
   * Perform static analysis on code
   * @param {string} code - Code to analyze
   * @param {string} language - Programming language
   */
  async performStaticAnalysis(code, language) {
    const issues = [];
    const lines = code.split('\n');

    // JavaScript/TypeScript analysis
    if (language === 'javascript' || language === 'typescript') {
      // Check for common issues
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        
        // Unused variables
        if (line.includes('const ') && line.includes('=') && !line.includes('//')) {
          const varMatch = line.match(/const\s+(\w+)\s*=/);
          if (varMatch) {
            const varName = varMatch[1];
            const isUsed = code.includes(varName) && 
                          code.indexOf(varName, code.indexOf(line) + line.length) !== -1;
            if (!isUsed) {
              issues.push({
                type: 'warning',
                severity: 'medium',
                line: lineNumber,
                message: `Unused variable '${varName}'`,
                suggestion: 'Remove the variable or use it in your code'
              });
            }
          }
        }

        // Console.log statements (development)
        if (line.includes('console.log(')) {
          issues.push({
            type: 'info',
            severity: 'low',
            line: lineNumber,
            message: 'Console.log statement found',
            suggestion: 'Consider removing console.log statements for production'
          });
        }

        // Potential undefined access
        if (line.includes('.')) {
          const dotMatches = line.match(/\w+\.\w+/g);
          if (dotMatches) {
            dotMatches.forEach(match => {
              if (match.includes('undefined') || match.includes('null')) {
                issues.push({
                  type: 'error',
                  severity: 'high',
                  line: lineNumber,
                  message: `Potential undefined/null access: ${match}`,
                  suggestion: 'Add null/undefined checks before accessing properties'
                });
              }
            });
          }
        }

        // Missing semicolons (optional warning)
        if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && 
            !line.trim().endsWith('}') && !line.includes('//') && !line.includes('/*')) {
          issues.push({
            type: 'style',
            severity: 'low',
            line: lineNumber,
            message: 'Missing semicolon',
            suggestion: 'Consider adding a semicolon for consistency'
          });
        }
      });
    }

    // Python analysis
    if (language === 'python') {
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        
        // Unused imports (basic check)
        if (line.startsWith('import ') || line.startsWith('from ')) {
          const importMatch = line.match(/(?:import|from)\s+(\w+)/);
          if (importMatch) {
            const moduleName = importMatch[1];
            const isUsed = code.includes(moduleName) && 
                          code.indexOf(moduleName, code.indexOf(line) + line.length) !== -1;
            if (!isUsed) {
              issues.push({
                type: 'warning',
                severity: 'medium',
                line: lineNumber,
                message: `Potentially unused import: ${moduleName}`,
                suggestion: 'Remove the import if not needed'
              });
            }
          }
        }

        // Print statements (development)
        if (line.includes('print(')) {
          issues.push({
            type: 'info',
            severity: 'low',
            line: lineNumber,
            message: 'Print statement found',
            suggestion: 'Consider using logging instead of print for production'
          });
        }

        // Indentation issues
        if (line.trim() && !line.startsWith(' ') && !line.startsWith('\t')) {
          const prevLine = lines[index - 1];
          if (prevLine && prevLine.trim().endsWith(':')) {
            issues.push({
              type: 'error',
              severity: 'high',
              line: lineNumber,
              message: 'Indentation expected after colon',
              suggestion: 'Add proper indentation for the code block'
            });
          }
        }
      });
    }

    return { issues };
  }

  /**
   * Get AI-powered debugging suggestions
   * @param {string} code - Code to analyze
   * @param {string} language - Programming language
   */
  async getAIDebugSuggestions(code, language) {
    // This would typically use AI to analyze the code
    // For now, we'll provide some common debugging suggestions
    const suggestions = [];

    // Check for common patterns that might cause issues
    if (code.includes('async') && code.includes('await')) {
      suggestions.push({
        type: 'info',
        severity: 'medium',
        line: 0,
        message: 'Async/await code detected',
        suggestion: 'Consider adding try-catch blocks around await calls for better error handling'
      });
    }

    if (code.includes('fetch(') || code.includes('axios.')) {
      suggestions.push({
        type: 'info',
        severity: 'medium',
        line: 0,
        message: 'HTTP requests detected',
        suggestion: 'Ensure proper error handling for network requests'
      });
    }

    if (code.includes('localStorage') || code.includes('sessionStorage')) {
      suggestions.push({
        type: 'info',
        severity: 'low',
        line: 0,
        message: 'Browser storage usage detected',
        suggestion: 'Consider error handling for storage quota exceeded scenarios'
      });
    }

    return suggestions;
  }

  /**
   * Generate summary of issues
   * @param {Array} issues - Array of issues
   */
  generateSummary(issues) {
    const summary = {
      total: issues.length,
      errors: issues.filter(i => i.severity === 'high').length,
      warnings: issues.filter(i => i.severity === 'medium').length,
      info: issues.filter(i => i.severity === 'low').length,
      style: issues.filter(i => i.type === 'style').length
    };

    return summary;
  }

  /**
   * Run code with debugging
   * @param {string} code - Code to run
   * @param {string} language - Programming language
   * @param {string} sessionId - Debug session ID
   */
  async runWithDebugging(code, language, sessionId = 'default') {
    const session = {
      id: sessionId,
      code: code,
      language: language,
      startTime: new Date(),
      logs: [],
      errors: [],
      breakpoints: []
    };

    this.debugSessions.set(sessionId, session);

    try {
      // Create temporary file
      const tempFile = await this.createTempFile(code, language);
      
      // Run the code based on language
      const result = await this.executeCode(tempFile, language, sessionId);
      
      // Clean up
      await fs.unlink(tempFile);
      
      return {
        success: true,
        sessionId: sessionId,
        result: result,
        logs: session.logs
      };
    } catch (error) {
      session.errors.push(error.message);
      return {
        success: false,
        sessionId: sessionId,
        error: error.message,
        logs: session.logs
      };
    }
  }

  /**
   * Create temporary file for execution
   * @param {string} code - Code content
   * @param {string} language - Programming language
   */
  async createTempFile(code, language) {
    const extensions = {
      javascript: '.js',
      typescript: '.ts',
      python: '.py',
      html: '.html',
      css: '.css'
    };

    const ext = extensions[language] || '.txt';
    const tempFile = path.join(require('os').tmpdir(), `debug_${Date.now()}${ext}`);
    
    await fs.writeFile(tempFile, code);
    return tempFile;
  }

  /**
   * Execute code based on language
   * @param {string} filePath - Path to the file
   * @param {string} language - Programming language
   * @param {string} sessionId - Debug session ID
   */
  async executeCode(filePath, language, sessionId) {
    return new Promise((resolve, reject) => {
      let command, args;

      switch (language) {
        case 'javascript':
          command = 'node';
          args = [filePath];
          break;
        case 'python':
          command = 'python';
          args = [filePath];
          break;
        default:
          reject(new Error(`Unsupported language: ${language}`));
          return;
      }

      const process = spawn(command, args);
      const session = this.debugSessions.get(sessionId);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        session.logs.push({ type: 'stdout', timestamp: new Date(), data: output });
      });

      process.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        session.logs.push({ type: 'stderr', timestamp: new Date(), data: output });
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Add breakpoint
   * @param {string} sessionId - Debug session ID
   * @param {number} line - Line number
   */
  addBreakpoint(sessionId, line) {
    const session = this.debugSessions.get(sessionId);
    if (session) {
      session.breakpoints.push(line);
      return { success: true, breakpoint: line };
    }
    return { success: false, error: 'Session not found' };
  }

  /**
   * Remove breakpoint
   * @param {string} sessionId - Debug session ID
   * @param {number} line - Line number
   */
  removeBreakpoint(sessionId, line) {
    const session = this.debugSessions.get(sessionId);
    if (session) {
      const index = session.breakpoints.indexOf(line);
      if (index > -1) {
        session.breakpoints.splice(index, 1);
        return { success: true };
      }
    }
    return { success: false, error: 'Breakpoint not found' };
  }

  /**
   * Get debug session info
   * @param {string} sessionId - Debug session ID
   */
  getSessionInfo(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (session) {
      return {
        success: true,
        session: {
          id: session.id,
          language: session.language,
          startTime: session.startTime,
          logs: session.logs,
          errors: session.errors,
          breakpoints: session.breakpoints
        }
      };
    }
    return { success: false, error: 'Session not found' };
  }

  /**
   * Get all debug sessions
   */
  getAllSessions() {
    return Array.from(this.debugSessions.values());
  }

  /**
   * Clear debug session
   * @param {string} sessionId - Debug session ID
   */
  clearSession(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (session) {
      this.debugSessions.delete(sessionId);
      return { success: true };
    }
    return { success: false, error: 'Session not found' };
  }

  /**
   * Get debugging tips for common issues
   * @param {string} language - Programming language
   */
  getDebuggingTips(language) {
    const tips = {
      javascript: [
        'Use console.log() to debug variable values',
        'Check for undefined/null before accessing properties',
        'Use try-catch blocks for error handling',
        'Check browser console for errors',
        'Use debugger statement for breakpoints'
      ],
      python: [
        'Use print() to debug variable values',
        'Check indentation carefully',
        'Use try-except blocks for error handling',
        'Check for proper imports',
        'Use pdb for interactive debugging'
      ],
      typescript: [
        'Check TypeScript compiler errors',
        'Use strict type checking',
        'Check for proper interface implementations',
        'Use console.log() for debugging',
        'Check for undefined/null with type guards'
      ]
    };

    return tips[language] || tips.javascript;
  }

  /**
   * Generate debugging report
   * @param {string} sessionId - Debug session ID
   */
  generateReport(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const report = {
      sessionId: session.id,
      language: session.language,
      startTime: session.startTime,
      endTime: new Date(),
      duration: new Date() - session.startTime,
      totalLogs: session.logs.length,
      errors: session.errors.length,
      breakpoints: session.breakpoints.length,
      logs: session.logs,
      errors: session.errors,
      breakpoints: session.breakpoints
    };

    return { success: true, report };
  }
}

module.exports = { DebugService };
