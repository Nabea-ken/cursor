class OllamaService {
  constructor() {
    this.baseUrl = 'http://localhost:11434';
    this.model = 'codellama';
    this.isConnected = false;
  }

  /**
   * Set Ollama configuration
   * @param {string} baseUrl - Ollama server URL
   * @param {string} model - Model name
   */
  async setConfig(baseUrl, model) {
    this.baseUrl = baseUrl || 'http://localhost:11434';
    this.model = model || 'codellama';
    
    // Test connection
    try {
      await this.testConnection();
      this.isConnected = true;
      return { success: true };
    } catch (error) {
      this.isConnected = false;
      throw new Error(`Ollama connection failed: ${error.message}`);
    }
  }

  /**
   * Test connection to Ollama server
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return { success: true, models: data.models || [] };
    } catch (error) {
      throw new Error(`Cannot connect to Ollama at ${this.baseUrl}. Make sure Ollama is running.`);
    }
  }

  /**
   * Get inline code completion
   * @param {string} text - The current text in the editor
   * @param {Object} cursorPosition - The cursor position {line, column}
   * @param {string} language - The programming language
   * @returns {string} The completion suggestion
   */
  async getInlineCompletion(text, cursorPosition, language) {
    if (!this.isConnected) {
      throw new Error('Ollama not connected. Please configure Ollama first.');
    }

    const lines = text.split('\n');
    const currentLine = lines[cursorPosition.line] || '';
    const beforeCursor = currentLine.substring(0, cursorPosition.column);
    const afterCursor = currentLine.substring(cursorPosition.column);

    // Get context from previous lines
    const contextLines = lines.slice(Math.max(0, cursorPosition.line - 10), cursorPosition.line);
    const context = contextLines.join('\n');

    const prompt = `You are an expert ${language} programmer. Complete the code at the cursor position.

Context (previous lines):
${context}

Current line before cursor: ${beforeCursor}
Current line after cursor: ${afterCursor}

Provide only the completion that should appear at the cursor position. Do not repeat any existing code. Keep it concise and natural.`;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.9,
            max_tokens: 200
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response?.trim() || '';
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error(`Ollama completion failed: ${error.message}`);
    }
  }

  /**
   * Chat with AI about code
   * @param {string} message - The user's message
   * @param {string} context - Optional code context
   * @returns {string} The AI response
   */
  async chat(message, context = '') {
    if (!this.isConnected) {
      throw new Error('Ollama not connected. Please configure Ollama first.');
    }

    const systemPrompt = `You are an expert programming assistant. Help users with their code questions and problems. 
Be concise, helpful, and provide practical solutions. If code context is provided, use it to give more relevant answers.`;

    const userPrompt = context 
      ? `Context:\n\`\`\`\n${context}\n\`\`\`\n\nQuestion: ${message}`
      : message;

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            num_predict: 500,  // Reduced from max_tokens for faster response
            num_ctx: 2048,     // Context window
            num_thread: 4      // Use 4 threads for faster processing
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'No response received';
    } catch (error) {
      console.error('Ollama API error:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Ollama request timed out. The model is taking too long to respond. Try a shorter question.');
      } else if (error.code === 'UND_ERR_HEADERS_TIMEOUT') {
        throw new Error('Ollama connection timeout. Make sure Ollama is running and try again.');
      } else {
        throw new Error(`Ollama chat failed: ${error.message}`);
      }
    }
  }

  /**
   * Refactor code using AI
   * @param {string} code - The code to refactor
   * @param {string} language - The programming language
   * @returns {string} The refactored code
   */
  async refactorCode(code, language) {
    if (!this.isConnected) {
      throw new Error('Ollama not connected. Please configure Ollama first.');
    }

    const prompt = `Refactor the following ${language} code to improve readability, performance, and maintainability. 
Keep the same functionality but make it cleaner and more efficient.

Code to refactor:
\`\`\`${language}
${code}
\`\`\`

Provide only the refactored code, no explanations.`;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.2,
            top_p: 0.9,
            max_tokens: 1000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || code;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error(`Ollama refactoring failed: ${error.message}`);
    }
  }

  /**
   * Explain code using AI
   * @param {string} code - The code to explain
   * @param {string} language - The programming language
   * @returns {string} The explanation
   */
  async explainCode(code, language) {
    if (!this.isConnected) {
      throw new Error('Ollama not connected. Please configure Ollama first.');
    }

    const prompt = `Explain the following ${language} code in a clear and concise manner. 
Focus on what the code does, how it works, and any important concepts or patterns used.

Code to explain:
\`\`\`${language}
${code}
\`\`\`

Provide a clear explanation that would help someone understand the code.`;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: 1000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'Unable to explain the code';
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error(`Ollama explanation failed: ${error.message}`);
    }
  }

  /**
   * Generate code based on description
   * @param {string} description - Code description
   * @param {string} language - Programming language
   * @returns {string} Generated code
   */
  async generateCode(description, language) {
    if (!this.isConnected) {
      throw new Error('Ollama not connected. Please configure Ollama first.');
    }

    const prompt = `Generate ${language} code based on the following description:

${description}

Provide only the code, no explanations. Make sure the code is complete and functional.`;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.2,
            top_p: 0.9,
            max_tokens: 1500
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error(`Ollama code generation failed: ${error.message}`);
    }
  }

  /**
   * Check if service is ready
   * @returns {boolean}
   */
  async isReady() {
    return this.isConnected;
  }

  /**
   * Get available models
   * @returns {Array} List of available models
   */
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  }
}

module.exports = { OllamaService };
