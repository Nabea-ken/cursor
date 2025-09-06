const { AIService } = require('./ai-service');

class AIManager {
  constructor() {
    this.providers = {
      openai: null,
      ollama: null,
      huggingface: null
    };
    this.currentProvider = null;
    this.providerType = null;
  }

  /**
   * Initialize a provider
   * @param {string} providerType - 'openai', 'ollama', or 'huggingface'
   * @param {Object} config - Provider configuration
   */
  async initializeProvider(providerType, config) {
    try {
      switch (providerType) {
        case 'openai':
          await this.initializeOpenAI(config);
          break;
        case 'ollama':
          await this.initializeOllama(config);
          break;
        case 'huggingface':
          await this.initializeHuggingFace(config);
          break;
        default:
          throw new Error(`Unknown provider type: ${providerType}`);
      }

      this.providerType = providerType;
      return { success: true, provider: providerType };
    } catch (error) {
      console.error(`Failed to initialize ${providerType}:`, error);
      throw error;
    }
  }

  /**
   * Initialize OpenAI provider
   */
  async initializeOpenAI(config) {
    const { AIService } = require('./ai-service');
    this.providers.openai = new AIService();
    
    if (config.apiKey) {
      await this.providers.openai.setApiKey(config.apiKey);
    }
    
    if (config.model) {
      this.providers.openai.model = config.model;
    }
    
    this.currentProvider = this.providers.openai;
  }

  /**
   * Initialize Ollama provider
   */
  async initializeOllama(config) {
    const { OllamaService } = require('./ollama-service');
    this.providers.ollama = new OllamaService();
    
    await this.providers.ollama.setConfig(config.baseUrl, config.model);
    this.currentProvider = this.providers.ollama;
  }

  /**
   * Initialize HuggingFace provider
   */
  async initializeHuggingFace(config) {
    const { HuggingFaceService } = require('./huggingface-service');
    this.providers.huggingface = new HuggingFaceService();
    
    await this.providers.huggingface.setConfig(config.apiKey, config.model);
    this.currentProvider = this.providers.huggingface;
  }

  /**
   * Get inline code completion
   */
  async getInlineCompletion(text, cursorPosition, language) {
    if (!this.currentProvider) {
      throw new Error('No AI provider configured. Please configure an AI provider first.');
    }

    return await this.currentProvider.getInlineCompletion(text, cursorPosition, language);
  }

  /**
   * Chat with AI
   */
  async chat(message, context = '') {
    if (!this.currentProvider) {
      throw new Error('No AI provider configured. Please configure an AI provider first.');
    }

    return await this.currentProvider.chat(message, context);
  }

  /**
   * Refactor code
   */
  async refactorCode(code, language) {
    if (!this.currentProvider) {
      throw new Error('No AI provider configured. Please configure an AI provider first.');
    }

    return await this.currentProvider.refactorCode(code, language);
  }

  /**
   * Explain code
   */
  async explainCode(code, language) {
    if (!this.currentProvider) {
      throw new Error('No AI provider configured. Please configure an AI provider first.');
    }

    return await this.currentProvider.explainCode(code, language);
  }

  /**
   * Generate code
   */
  async generateCode(description, language) {
    if (!this.currentProvider) {
      throw new Error('No AI provider configured. Please configure an AI provider first.');
    }

    if (this.currentProvider.generateCode) {
      return await this.currentProvider.generateCode(description, language);
    } else {
      // Fallback to chat-based generation
      const prompt = `Generate ${language} code for: ${description}`;
      return await this.currentProvider.chat(prompt);
    }
  }

  /**
   * Test provider connection
   */
  async testConnection(providerType, config) {
    try {
      const tempManager = new AIManager();
      await tempManager.initializeProvider(providerType, config);
      
      // Test with a simple prompt
      const testResponse = await tempManager.chat('Hello, this is a test message.');
      
      return { 
        success: true, 
        message: 'Connection successful',
        testResponse: testResponse.substring(0, 100) + '...'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  }

  /**
   * Get current provider info
   */
  getCurrentProviderInfo() {
    if (!this.currentProvider) {
      return { type: null, name: 'None', status: 'Not configured' };
    }

    return {
      type: this.providerType,
      name: this.getProviderDisplayName(this.providerType),
      status: 'Ready'
    };
  }

  /**
   * Get provider display name
   */
  getProviderDisplayName(providerType) {
    const names = {
      openai: 'OpenAI GPT',
      ollama: 'Ollama (Local)',
      huggingface: 'HuggingFace'
    };
    return names[providerType] || providerType;
  }

  /**
   * Get available models for a provider
   */
  async getAvailableModels(providerType) {
    try {
      switch (providerType) {
        case 'openai':
          return [
            { value: 'gpt-4o-mini', label: 'GPT-4o-mini (Recommended)' },
            { value: 'gpt-4o', label: 'GPT-4o' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5-turbo' }
          ];
        case 'ollama':
          try {
            const { OllamaService } = require('./ollama-service');
            const ollamaService = new OllamaService();
            const models = await ollamaService.getAvailableModels();
            return models.map(model => ({
              value: model.name,
              label: `${model.name} (${Math.round(model.size / 1024 / 1024 / 1024 * 10) / 10}GB)`
            }));
          } catch (error) {
            console.error('Failed to fetch Ollama models:', error);
            return [
              { value: 'llama3.2:1b', label: 'llama3.2:1b (Default)' }
            ];
          }
        case 'huggingface':
          return [
            { value: 'microsoft/DialoGPT-medium', label: 'DialoGPT Medium (Chat)' },
            { value: 'microsoft/DialoGPT-small', label: 'DialoGPT Small' },
            { value: 'gpt2', label: 'GPT-2' },
            { value: 'distilgpt2', label: 'DistilGPT-2' }
          ];
        default:
          return [];
      }
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  }

  /**
   * Check if provider is ready
   */
  async isReady() {
    if (!this.currentProvider) {
      return false;
    }

    if (this.currentProvider.isReady) {
      return await this.currentProvider.isReady();
    }

    return true;
  }

  /**
   * Clear current provider
   */
  clearProvider() {
    this.currentProvider = null;
    this.providerType = null;
  }

  /**
   * Get provider configuration template
   */
  getProviderConfigTemplate(providerType) {
    switch (providerType) {
      case 'openai':
        return {
          apiKey: '',
          model: 'gpt-4o-mini'
        };
      case 'ollama':
        return {
          baseUrl: 'http://localhost:11434',
          model: 'codellama'
        };
      case 'huggingface':
        return {
          apiKey: '',
          model: 'microsoft/DialoGPT-medium'
        };
      default:
        return {};
    }
  }

  /**
   * Check if there's a valid API key configured
   */
  async hasValidApiKey() {
    // Always return false to prevent automatic initialization on startup
    // Users must manually configure providers through the UI
    return false;
  }
}

module.exports = { AIManager };
