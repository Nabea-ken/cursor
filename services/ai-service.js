const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = null;
    this.apiKey = null;
    this.model = 'gpt-4o-mini'; // Default model
    this.maxTokens = 1000;
    this.temperature = 0.3;
  }

  /**
   * Set the OpenAI API key
   * @param {string} apiKey - The OpenAI API key
   */
  async setApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key provided');
    }

    this.apiKey = apiKey;
    this.openai = new OpenAI({
      apiKey: this.apiKey,
      dangerouslyAllowBrowser: false // We're in Node.js environment
    });

    // Test the API key by making a simple request
    try {
      await this.openai.models.list();
    } catch (error) {
      throw new Error(`Invalid API key: ${error.message}`);
    }
  }

  /**
   * Check if a valid API key is set
   * @returns {boolean}
   */
  async hasValidApiKey() {
    return this.apiKey !== null && this.openai !== null;
  }

  /**
   * Clear the stored API key
   */
  clearApiKey() {
    this.apiKey = null;
    this.openai = null;
  }

  /**
   * Get inline code completion
   * @param {string} text - The current text in the editor
   * @param {Object} cursorPosition - The cursor position {line, column}
   * @param {string} language - The programming language
   * @returns {string} The completion suggestion
   */
  async getInlineCompletion(text, cursorPosition, language) {
    if (!this.openai) {
      throw new Error('API key not set. Please set your OpenAI API key first.');
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
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert ${language} programmer. Provide concise, accurate code completions. Only return the completion text, nothing else.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.1,
        stop: ['\n', ';', '}', ')', ']']
      });

      const completion = response.choices[0]?.message?.content?.trim();
      return completion || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`AI completion failed: ${error.message}`);
    }
  }

  /**
   * Chat with AI about code
   * @param {string} message - The user's message
   * @param {string} context - Optional code context
   * @returns {string} The AI response
   */
  async chat(message, context = '') {
    if (!this.openai) {
      throw new Error('API key not set. Please set your OpenAI API key first.');
    }

    const systemPrompt = `You are an expert programming assistant. Help users with their code questions and problems. 
Be concise, helpful, and provide practical solutions. If code context is provided, use it to give more relevant answers.`;

    const userPrompt = context 
      ? `Context:\n\`\`\`\n${context}\n\`\`\`\n\nQuestion: ${message}`
      : message;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      });

      return response.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  /**
   * Refactor code using AI
   * @param {string} code - The code to refactor
   * @param {string} language - The programming language
   * @returns {string} The refactored code
   */
  async refactorCode(code, language) {
    if (!this.openai) {
      throw new Error('API key not set. Please set your OpenAI API key first.');
    }

    const prompt = `Refactor the following ${language} code to improve readability, performance, and maintainability. 
Keep the same functionality but make it cleaner and more efficient.

Code to refactor:
\`\`\`${language}
${code}
\`\`\`

Provide only the refactored code, no explanations.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert ${language} programmer specializing in code refactoring. Provide clean, efficient, and well-structured code.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.2
      });

      return response.choices[0]?.message?.content || code;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Refactoring failed: ${error.message}`);
    }
  }

  /**
   * Explain code using AI
   * @param {string} code - The code to explain
   * @param {string} language - The programming language
   * @returns {string} The explanation
   */
  async explainCode(code, language) {
    if (!this.openai) {
      throw new Error('API key not set. Please set your OpenAI API key first.');
    }

    const prompt = `Explain the following ${language} code in a clear and concise manner. 
Focus on what the code does, how it works, and any important concepts or patterns used.

Code to explain:
\`\`\`${language}
${code}
\`\`\`

Provide a clear explanation that would help someone understand the code.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert ${language} programmer and educator. Explain code clearly and concisely.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.3
      });

      return response.choices[0]?.message?.content || 'Unable to explain the code';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Explanation failed: ${error.message}`);
    }
  }

  /**
   * Get code suggestions for a specific context
   * @param {string} context - The code context
   * @param {string} language - The programming language
   * @param {string} task - The task description
   * @returns {string} The suggested code
   */
  async getCodeSuggestion(context, language, task) {
    if (!this.openai) {
      throw new Error('API key not set. Please set your OpenAI API key first.');
    }

    const prompt = `Based on the following ${language} code context, provide a solution for: ${task}

Context:
\`\`\`${language}
${context}
\`\`\`

Provide only the code solution, no explanations.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert ${language} programmer. Provide practical code solutions.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.2
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Code suggestion failed: ${error.message}`);
    }
  }
}

module.exports = { AIService };
