const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const path = require('path');
const os = require('os');

class TerminalService extends EventEmitter {
  constructor() {
    super();
    this.processes = new Map();
    this.currentWorkingDirectory = os.homedir();
    this.shell = this.getDefaultShell();
  }

  /**
   * Get default shell for the platform
   */
  getDefaultShell() {
    const platform = os.platform();
    if (platform === 'win32') {
      return 'powershell.exe';
    } else if (platform === 'darwin') {
      return '/bin/zsh';
    } else {
      return '/bin/bash';
    }
  }

  /**
   * Set working directory
   * @param {string} directory - New working directory
   */
  setWorkingDirectory(directory) {
    this.currentWorkingDirectory = directory;
  }

  /**
   * Get current working directory
   */
  getWorkingDirectory() {
    return this.currentWorkingDirectory;
  }

  /**
   * Execute a command
   * @param {string} command - Command to execute
   * @param {string} sessionId - Unique session identifier
   */
  executeCommand(command, sessionId = 'default') {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let shellCommand, shellArgs;

      if (platform === 'win32') {
        shellCommand = 'powershell.exe';
        shellArgs = ['-Command', command];
      } else {
        shellCommand = '/bin/bash';
        shellArgs = ['-c', command];
      }

      const process = spawn(shellCommand, shellArgs, {
        cwd: this.currentWorkingDirectory,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.processes.set(sessionId, process);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        this.emit('output', { sessionId, type: 'stdout', data: output });
      });

      process.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        this.emit('output', { sessionId, type: 'stderr', data: output });
      });

      process.on('close', (code) => {
        this.processes.delete(sessionId);
        this.emit('close', { sessionId, code });
        
        if (code === 0) {
          resolve({ success: true, stdout, stderr, code });
        } else {
          reject({ success: false, stdout, stderr, code });
        }
      });

      process.on('error', (error) => {
        this.processes.delete(sessionId);
        this.emit('error', { sessionId, error });
        reject({ success: false, error: error.message });
      });

      this.emit('start', { sessionId, command });
    });
  }

  /**
   * Execute a command with AI assistance
   * @param {string} description - Natural language description of what to do
   * @param {string} sessionId - Unique session identifier
   */
  async executeWithAI(description, sessionId = 'ai-assisted') {
    try {
      // Generate command from description
      const command = await this.generateCommandFromDescription(description);
      
      if (!command) {
        throw new Error('Could not generate command from description');
      }

      // Execute the generated command
      const result = await this.executeCommand(command, sessionId);
      
      return {
        success: true,
        originalDescription: description,
        generatedCommand: command,
        result
      };
    } catch (error) {
      return {
        success: false,
        originalDescription: description,
        error: error.message
      };
    }
  }

  /**
   * Generate command from natural language description
   * @param {string} description - Natural language description
   */
  async generateCommandFromDescription(description) {
    // This would typically use AI to generate commands
    // For now, we'll use a simple mapping system
    const commandMap = {
      'list files': 'ls',
      'list files with details': 'ls -la',
      'show current directory': 'pwd',
      'change directory': 'cd',
      'create directory': 'mkdir',
      'remove file': 'rm',
      'remove directory': 'rmdir',
      'copy file': 'cp',
      'move file': 'mv',
      'show file contents': 'cat',
      'search in files': 'grep',
      'find files': 'find',
      'show disk usage': 'df',
      'show memory usage': 'free',
      'show process list': 'ps aux',
      'kill process': 'kill',
      'install package': 'npm install',
      'run tests': 'npm test',
      'start development server': 'npm start',
      'build project': 'npm run build'
    };

    const lowerDescription = description.toLowerCase();
    
    for (const [key, command] of Object.entries(commandMap)) {
      if (lowerDescription.includes(key)) {
        return command;
      }
    }

    // If no match found, return the description as-is (user can modify)
    return description;
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      shell: this.shell,
      workingDirectory: this.currentWorkingDirectory,
      homeDirectory: os.homedir(),
      username: os.userInfo().username
    };
  }

  /**
   * Get common commands for the current context
   * @param {string} context - Current context (e.g., 'node', 'git', 'general')
   */
  getCommonCommands(context = 'general') {
    const commands = {
      general: [
        { command: 'ls', description: 'List files' },
        { command: 'pwd', description: 'Show current directory' },
        { command: 'cd', description: 'Change directory' },
        { command: 'mkdir', description: 'Create directory' },
        { command: 'rm', description: 'Remove file' },
        { command: 'cp', description: 'Copy file' },
        { command: 'mv', description: 'Move file' }
      ],
      node: [
        { command: 'npm install', description: 'Install dependencies' },
        { command: 'npm start', description: 'Start development server' },
        { command: 'npm test', description: 'Run tests' },
        { command: 'npm run build', description: 'Build project' },
        { command: 'node', description: 'Run Node.js script' }
      ],
      git: [
        { command: 'git status', description: 'Show repository status' },
        { command: 'git add .', description: 'Stage all changes' },
        { command: 'git commit -m "message"', description: 'Commit changes' },
        { command: 'git push', description: 'Push to remote' },
        { command: 'git pull', description: 'Pull from remote' },
        { command: 'git branch', description: 'List branches' }
      ]
    };

    return commands[context] || commands.general;
  }

  /**
   * Kill a running process
   * @param {string} sessionId - Session identifier
   */
  killProcess(sessionId) {
    const process = this.processes.get(sessionId);
    if (process) {
      process.kill();
      this.processes.delete(sessionId);
      this.emit('killed', { sessionId });
      return { success: true };
    }
    return { success: false, error: 'Process not found' };
  }

  /**
   * Kill all running processes
   */
  killAllProcesses() {
    const sessionIds = Array.from(this.processes.keys());
    sessionIds.forEach(sessionId => {
      this.killProcess(sessionId);
    });
    return { success: true, killed: sessionIds.length };
  }

  /**
   * Get active processes
   */
  getActiveProcesses() {
    return Array.from(this.processes.keys());
  }

  /**
   * Validate command for security
   * @param {string} command - Command to validate
   */
  validateCommand(command) {
    const dangerousCommands = [
      'rm -rf /',
      'rm -rf /*',
      'format',
      'dd if=/dev/zero',
      'mkfs',
      'fdisk',
      'chmod 777',
      'chown root'
    ];

    const lowerCommand = command.toLowerCase();
    
    for (const dangerous of dangerousCommands) {
      if (lowerCommand.includes(dangerous)) {
        return { valid: false, reason: `Dangerous command detected: ${dangerous}` };
      }
    }

    return { valid: true };
  }

  /**
   * Get command suggestions based on current context
   * @param {string} partialCommand - Partial command typed by user
   * @param {string} context - Current context
   */
  getCommandSuggestions(partialCommand, context = 'general') {
    const commonCommands = this.getCommonCommands(context);
    const suggestions = commonCommands.filter(cmd => 
      cmd.command.toLowerCase().includes(partialCommand.toLowerCase()) ||
      cmd.description.toLowerCase().includes(partialCommand.toLowerCase())
    );

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Execute multiple commands in sequence
   * @param {Array} commands - Array of commands to execute
   * @param {string} sessionId - Session identifier
   */
  async executeCommands(commands, sessionId = 'batch') {
    const results = [];
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      try {
        const result = await this.executeCommand(command, `${sessionId}-${i}`);
        results.push({ command, success: true, result });
      } catch (error) {
        results.push({ command, success: false, error });
        // Stop execution on first error
        break;
      }
    }

    return results;
  }
}

module.exports = { TerminalService };
