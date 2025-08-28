class HuggingFaceService {
  constructor() {
    this.apiKey = null;
    this.model = 'microsoft/DialoGPT-medium';
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    this.isConfigured = false;
  }

  async setConfig(apiKey, model) {
    this.apiKey = apiKey || null;
    this.model = model || 'microsoft/DialoGPT-medium';
    this.isConfigured = true;
    return { success: true };
  }

  async testConnection() {
    try {
      const headers = {};
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'GET',
        headers: headers
      });

      return { success: true };
    } catch (error) {
      throw new Error(`Cannot connect to HuggingFace API. ${error.message}`);
    }
  }

  async getInlineCompletion(text, cursorPosition, language) {
    if (!this.isConfigured) {
      throw new Error('HuggingFace not configured.');
    }

    const lines = text.split('\n');
    const currentLine = lines[cursorPosition.line] || '';
    const beforeCursor = currentLine.substring(0, cursorPosition.column);

    const prompt = `Complete this ${language} code:\n${beforeCursor}`;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 50,
            temperature: 0.1,
            do_sample: true,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let completion = '';
      
      if (Array.isArray(data)) {
        completion = data[0]?.generated_text || '';
      } else if (data.generated_text) {
        completion = data.generated_text;
      }

      completion = completion.replace(prompt, '').trim();
      const words = completion.split(' ');
      if (words.length > 10) {
        completion = words.slice(0, 10).join(' ');
      }

      return completion || '';
    } catch (error) {
      console.error('HuggingFace API error:', error);
      throw new Error(`HuggingFace completion failed: ${error.message}`);
    }
  }

  async chat(message, context = '') {
    if (!this.isConfigured) {
      throw new Error('HuggingFace not configured.');
    }

    const prompt = context 
      ? `Context: ${context}\n\nQuestion: ${message}\n\nAnswer:`
      : `Question: ${message}\n\nAnswer:`;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let response_text = '';
      
      if (Array.isArray(data)) {
        response_text = data[0]?.generated_text || '';
      } else if (data.generated_text) {
        response_text = data.generated_text;
      }

      response_text = response_text.replace(prompt, '').trim();
      return response_text || 'No response received';
    } catch (error) {
      console.error('HuggingFace API error:', error);
      throw new Error(`HuggingFace chat failed: ${error.message}`);
    }
  }

  async refactorCode(code, language) {
    if (!this.isConfigured) {
      throw new Error('HuggingFace not configured.');
    }

    const prompt = `Refactor this ${language} code to improve it:\n\n${code}\n\nRefactored code:`;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 500,
            temperature: 0.3,
            do_sample: true,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let refactored_code = '';
      
      if (Array.isArray(data)) {
        refactored_code = data[0]?.generated_text || '';
      } else if (data.generated_text) {
        refactored_code = data.generated_text;
      }

      refactored_code = refactored_code.replace(prompt, '').trim();
      return refactored_code || code;
    } catch (error) {
      console.error('HuggingFace API error:', error);
      throw new Error(`HuggingFace refactoring failed: ${error.message}`);
    }
  }

  async explainCode(code, language) {
    if (!this.isConfigured) {
      throw new Error('HuggingFace not configured.');
    }

    const prompt = `Explain this ${language} code:\n\n${code}\n\nExplanation:`;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 300,
            temperature: 0.5,
            do_sample: true,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let explanation = '';
      
      if (Array.isArray(data)) {
        explanation = data[0]?.generated_text || '';
      } else if (data.generated_text) {
        explanation = data.generated_text;
      }

      explanation = explanation.replace(prompt, '').trim();
      return explanation || 'Unable to explain the code';
    } catch (error) {
      console.error('HuggingFace API error:', error);
      throw new Error(`HuggingFace explanation failed: ${error.message}`);
    }
  }

  async generateCode(description, language) {
    if (!this.isConfigured) {
      throw new Error('HuggingFace not configured.');
    }

    const prompt = `Generate ${language} code for: ${description}\n\nCode:`;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 400,
            temperature: 0.2,
            do_sample: true,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let generated_code = '';
      
      if (Array.isArray(data)) {
        generated_code = data[0]?.generated_text || '';
      } else if (data.generated_text) {
        generated_code = data.generated_text;
      }

      generated_code = generated_code.replace(prompt, '').trim();
      return generated_code || '';
    } catch (error) {
      console.error('HuggingFace API error:', error);
      throw new Error(`HuggingFace code generation failed: ${error.message}`);
    }
  }

  async isReady() {
    return this.isConfigured;
  }

  getAvailableModels() {
    return [
      'microsoft/DialoGPT-medium',
      'microsoft/DialoGPT-small',
      'gpt2',
      'distilgpt2'
    ];
  }
}

module.exports = { HuggingFaceService };
