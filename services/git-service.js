const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

class GitService {
  constructor() {
    this.repositoryPath = null;
    this.isGitRepository = false;
  }

  /**
   * Initialize Git service for a directory
   * @param {string} directoryPath - Path to check for Git repository
   */
  async initialize(directoryPath) {
    try {
      this.repositoryPath = directoryPath;
      this.isGitRepository = await this.checkIfGitRepository(directoryPath);
      return { success: true, isGitRepository: this.isGitRepository };
    } catch (error) {
      console.error('Git initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if directory is a Git repository
   * @param {string} directoryPath - Directory to check
   */
  async checkIfGitRepository(directoryPath) {
    try {
      const { stdout } = await execAsync('git rev-parse --git-dir', { cwd: directoryPath });
      return stdout.trim() === '.git' || stdout.trim().includes('.git');
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Git status information
   */
  async getStatus() {
    if (!this.isGitRepository) {
      return { success: false, error: 'Not a Git repository' };
    }

    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: this.repositoryPath });
      const lines = stdout.trim().split('\n').filter(line => line.length > 0);
      
      const status = {
        modified: [],
        untracked: [],
        staged: [],
        deleted: []
      };

      lines.forEach(line => {
        const statusCode = line.substring(0, 2);
        const filePath = line.substring(3);
        
        if (statusCode.includes('M')) status.modified.push(filePath);
        if (statusCode.includes('A')) status.staged.push(filePath);
        if (statusCode.includes('D')) status.deleted.push(filePath);
        if (statusCode.includes('??')) status.untracked.push(filePath);
      });

      return { success: true, status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch() {
    if (!this.isGitRepository) {
      return { success: false, error: 'Not a Git repository' };
    }

    try {
      const { stdout } = await execAsync('git branch --show-current', { cwd: this.repositoryPath });
      return { success: true, branch: stdout.trim() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recent commit history
   * @param {number} limit - Number of commits to retrieve
   */
  async getRecentCommits(limit = 5) {
    if (!this.isGitRepository) {
      return { success: false, error: 'Not a Git repository' };
    }

    try {
      const { stdout } = await execAsync(
        `git log --oneline -n ${limit} --pretty=format:"%h|%an|%ad|%s" --date=short`,
        { cwd: this.repositoryPath }
      );

      const commits = stdout.trim().split('\n').filter(line => line.length > 0).map(line => {
        const [hash, author, date, message] = line.split('|');
        return { hash, author, date, message };
      });

      return { success: true, commits };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get file history
   * @param {string} filePath - Path to the file
   * @param {number} limit - Number of commits to retrieve
   */
  async getFileHistory(filePath, limit = 3) {
    if (!this.isGitRepository) {
      return { success: false, error: 'Not a Git repository' };
    }

    try {
      const { stdout } = await execAsync(
        `git log --oneline -n ${limit} --pretty=format:"%h|%an|%ad|%s" --date=short -- "${filePath}"`,
        { cwd: this.repositoryPath }
      );

      const commits = stdout.trim().split('\n').filter(line => line.length > 0).map(line => {
        const [hash, author, date, message] = line.split('|');
        return { hash, author, date, message };
      });

      return { success: true, commits };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get diff for a specific file
   * @param {string} filePath - Path to the file
   */
  async getFileDiff(filePath) {
    if (!this.isGitRepository) {
      return { success: false, error: 'Not a Git repository' };
    }

    try {
      const { stdout } = await execAsync(`git diff "${filePath}"`, { cwd: this.repositoryPath });
      return { success: true, diff: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo() {
    if (!this.isGitRepository) {
      return { success: false, error: 'Not a Git repository' };
    }

    try {
      const [branchResult, statusResult, commitsResult] = await Promise.all([
        this.getCurrentBranch(),
        this.getStatus(),
        this.getRecentCommits(3)
      ]);

      return {
        success: true,
        info: {
          branch: branchResult.success ? branchResult.branch : 'unknown',
          status: statusResult.success ? statusResult.status : {},
          recentCommits: commitsResult.success ? commitsResult.commits : []
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get context for AI operations
   * @param {string} filePath - Current file path
   */
  async getAIContext(filePath) {
    if (!this.isGitRepository) {
      return { success: false, context: 'Not a Git repository' };
    }

    try {
      const [status, branch, fileHistory, fileDiff] = await Promise.all([
        this.getStatus(),
        this.getCurrentBranch(),
        this.getFileHistory(filePath, 2),
        this.getFileDiff(filePath)
      ]);

      let context = `Git Repository Context:\n`;
      context += `Branch: ${branch.success ? branch.branch : 'unknown'}\n`;
      
      if (status.success) {
        const { status: statusInfo } = status;
        context += `Modified files: ${statusInfo.modified.length}\n`;
        context += `Untracked files: ${statusInfo.untracked.length}\n`;
        context += `Staged files: ${statusInfo.staged.length}\n`;
      }

      if (fileHistory.success && fileHistory.commits.length > 0) {
        context += `\nRecent changes to this file:\n`;
        fileHistory.commits.forEach(commit => {
          context += `- ${commit.hash}: ${commit.message} (${commit.author}, ${commit.date})\n`;
        });
      }

      if (fileDiff.success && fileDiff.diff) {
        context += `\nCurrent changes:\n${fileDiff.diff}\n`;
      }

      return { success: true, context };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Stage a file
   * @param {string} filePath - Path to the file to stage
   */
  async stageFile(filePath) {
    if (!this.isGitRepository) {
      return { success: false, error: 'Not a Git repository' };
    }

    try {
      await execAsync(`git add "${filePath}"`, { cwd: this.repositoryPath });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Commit staged changes
   * @param {string} message - Commit message
   */
  async commitChanges(message) {
    if (!this.isGitRepository) {
      return { success: false, error: 'Not a Git repository' };
    }

    try {
      await execAsync(`git commit -m "${message}"`, { cwd: this.repositoryPath });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get list of branches
   */
  async getBranches() {
    if (!this.isGitRepository) {
      return { success: false, error: 'Not a Git repository' };
    }

    try {
      const { stdout } = await execAsync('git branch -a', { cwd: this.repositoryPath });
      const branches = stdout.trim().split('\n').filter(line => line.length > 0).map(line => {
        const isCurrent = line.startsWith('*');
        const name = line.replace('* ', '').replace('remotes/', '').trim();
        return { name, isCurrent };
      });

      return { success: true, branches };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if file is tracked by Git
   * @param {string} filePath - Path to the file
   */
  async isFileTracked(filePath) {
    if (!this.isGitRepository) {
      return false;
    }

    try {
      await execAsync(`git ls-files --error-unmatch "${filePath}"`, { cwd: this.repositoryPath });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = { GitService };
