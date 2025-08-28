const EventEmitter = require('events');
const os = require('os');
const path = require('path');
const fs = require('fs').promises;

class AnalyticsService extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      performance: new Map(),
      userBehavior: new Map(),
      errors: new Map(),
      features: new Map()
    };
    this.isInitialized = false;
    this.startTime = null;
    this.sessionId = null;
  }

  /**
   * Initialize analytics service
   */
  async initialize() {
    try {
      this.startTime = new Date();
      this.sessionId = this.generateSessionId();
      this.isInitialized = true;
      
      // Start periodic metrics collection
      this.startPeriodicCollection();
      
      console.log('Analytics service initialized');
      return { success: true };
    } catch (error) {
      console.error('Analytics initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName, value, metadata = {}) {
    if (!this.isInitialized) return;

    const metric = {
      name: metricName,
      value: value,
      timestamp: new Date(),
      sessionId: this.sessionId,
      metadata: {
        ...metadata,
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };

    if (!this.metrics.performance.has(metricName)) {
      this.metrics.performance.set(metricName, []);
    }
    
    this.metrics.performance.get(metricName).push(metric);
    
    this.emit('performanceTracked', metric);
  }

  /**
   * Track user behavior
   */
  trackUserBehavior(action, data = {}) {
    if (!this.isInitialized) return;

    const behavior = {
      action: action,
      data: data,
      timestamp: new Date(),
      sessionId: this.sessionId,
      context: {
        currentFile: data.currentFile,
        language: data.language,
        lineCount: data.lineCount
      }
    };

    if (!this.metrics.userBehavior.has(action)) {
      this.metrics.userBehavior.set(action, []);
    }
    
    this.metrics.userBehavior.get(action).push(behavior);
    
    this.emit('behaviorTracked', behavior);
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    if (!this.isInitialized) return;

    const errorMetric = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      sessionId: this.sessionId,
      context: {
        ...context,
        platform: process.platform,
        nodeVersion: process.version
      }
    };

    if (!this.metrics.errors.has(error.name || 'Unknown')) {
      this.metrics.errors.set(error.name || 'Unknown', []);
    }
    
    this.metrics.errors.get(error.name || 'Unknown').push(errorMetric);
    
    this.emit('errorTracked', errorMetric);
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName, data = {}) {
    if (!this.isInitialized) return;

    const feature = {
      name: featureName,
      data: data,
      timestamp: new Date(),
      sessionId: this.sessionId
    };

    if (!this.metrics.features.has(featureName)) {
      this.metrics.features.set(featureName, []);
    }
    
    this.metrics.features.get(featureName).push(feature);
    
    this.emit('featureTracked', feature);
  }

  /**
   * Track AI interaction
   */
  trackAIInteraction(interaction) {
    this.trackFeatureUsage('ai_interaction', {
      type: interaction.type,
      provider: interaction.provider,
      model: interaction.model,
      tokens: interaction.tokens,
      duration: interaction.duration,
      success: interaction.success
    });
  }

  /**
   * Track file operations
   */
  trackFileOperation(operation) {
    this.trackUserBehavior('file_operation', {
      type: operation.type, // 'open', 'save', 'create', 'delete'
      filePath: operation.filePath,
      fileSize: operation.fileSize,
      language: operation.language
    });
  }

  /**
   * Track editor events
   */
  trackEditorEvent(event) {
    this.trackUserBehavior('editor_event', {
      type: event.type, // 'typing', 'selection', 'scroll', 'search'
      data: event.data
    });
  }

  /**
   * Track Git operations
   */
  trackGitOperation(operation) {
    this.trackUserBehavior('git_operation', {
      type: operation.type, // 'commit', 'push', 'pull', 'branch'
      repository: operation.repository,
      files: operation.files
    });
  }

  /**
   * Track terminal usage
   */
  trackTerminalUsage(command) {
    this.trackUserBehavior('terminal_command', {
      command: command.command,
      success: command.success,
      duration: command.duration
    });
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(metricName = null, limit = 100) {
    if (metricName) {
      const metrics = this.metrics.performance.get(metricName) || [];
      return metrics.slice(-limit);
    }
    
    const allMetrics = {};
    for (const [name, metrics] of this.metrics.performance) {
      allMetrics[name] = metrics.slice(-limit);
    }
    return allMetrics;
  }

  /**
   * Get user behavior metrics
   */
  getUserBehaviorMetrics(action = null, limit = 100) {
    if (action) {
      const behaviors = this.metrics.userBehavior.get(action) || [];
      return behaviors.slice(-limit);
    }
    
    const allBehaviors = {};
    for (const [name, behaviors] of this.metrics.userBehavior) {
      allBehaviors[name] = behaviors.slice(-limit);
    }
    return allBehaviors;
  }

  /**
   * Get error metrics
   */
  getErrorMetrics(errorName = null, limit = 100) {
    if (errorName) {
      const errors = this.metrics.errors.get(errorName) || [];
      return errors.slice(-limit);
    }
    
    const allErrors = {};
    for (const [name, errors] of this.metrics.errors) {
      allErrors[name] = errors.slice(-limit);
    }
    return allErrors;
  }

  /**
   * Get feature usage metrics
   */
  getFeatureUsageMetrics(featureName = null, limit = 100) {
    if (featureName) {
      const features = this.metrics.features.get(featureName) || [];
      return features.slice(-limit);
    }
    
    const allFeatures = {};
    for (const [name, features] of this.metrics.features) {
      allFeatures[name] = features.slice(-limit);
    }
    return allFeatures;
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const now = new Date();
    const sessionDuration = now - this.startTime;
    
    const stats = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration: sessionDuration,
      performance: {},
      behavior: {},
      errors: {},
      features: {}
    };

    // Calculate performance averages
    for (const [name, metrics] of this.metrics.performance) {
      if (metrics.length > 0) {
        const values = metrics.map(m => m.value);
        stats.performance[name] = {
          count: metrics.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: metrics[metrics.length - 1]
        };
      }
    }

    // Calculate behavior counts
    for (const [name, behaviors] of this.metrics.userBehavior) {
      stats.behavior[name] = {
        count: behaviors.length,
        lastUsed: behaviors.length > 0 ? behaviors[behaviors.length - 1].timestamp : null
      };
    }

    // Calculate error counts
    for (const [name, errors] of this.metrics.errors) {
      stats.errors[name] = {
        count: errors.length,
        lastError: errors.length > 0 ? errors[errors.length - 1].timestamp : null
      };
    }

    // Calculate feature usage
    for (const [name, features] of this.metrics.features) {
      stats.features[name] = {
        count: features.length,
        lastUsed: features.length > 0 ? features[features.length - 1].timestamp : null
      };
    }

    return stats;
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model
      },
      uptime: os.uptime()
    };
  }

  /**
   * Generate analytics report
   */
  async generateReport() {
    const report = {
      timestamp: new Date(),
      sessionStats: this.getSessionStats(),
      systemInfo: this.getSystemInfo(),
      performance: this.getPerformanceMetrics(),
      behavior: this.getUserBehaviorMetrics(),
      errors: this.getErrorMetrics(),
      features: this.getFeatureUsageMetrics()
    };

    return report;
  }

  /**
   * Export analytics data
   */
  async exportData() {
    const data = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      exportTime: new Date(),
      metrics: {
        performance: Object.fromEntries(this.metrics.performance),
        userBehavior: Object.fromEntries(this.metrics.userBehavior),
        errors: Object.fromEntries(this.metrics.errors),
        features: Object.fromEntries(this.metrics.features)
      }
    };

    return data;
  }

  /**
   * Start periodic metrics collection
   */
  startPeriodicCollection() {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.trackPerformance('memory_usage', process.memoryUsage().heapUsed);
      this.trackPerformance('cpu_usage', process.cpuUsage().user);
    }, 30000);

    // Collect system info every 5 minutes
    setInterval(() => {
      const systemInfo = this.getSystemInfo();
      this.trackPerformance('system_memory_usage', systemInfo.memory.used);
      this.trackPerformance('system_memory_free', systemInfo.memory.free);
    }, 300000);
  }

  /**
   * Clean up old metrics
   */
  cleanup() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Clean up old performance metrics
    for (const [name, metrics] of this.metrics.performance) {
      this.metrics.performance.set(name, 
        metrics.filter(m => m.timestamp > oneHourAgo)
      );
    }

    // Clean up old behavior metrics
    for (const [name, behaviors] of this.metrics.userBehavior) {
      this.metrics.userBehavior.set(name,
        behaviors.filter(b => b.timestamp > oneHourAgo)
      );
    }

    // Keep all errors for debugging
    // Keep all feature usage for analysis
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics.performance.clear();
    this.metrics.userBehavior.clear();
    this.metrics.errors.clear();
    this.metrics.features.clear();
    
    this.startTime = new Date();
    this.sessionId = this.generateSessionId();
  }

  /**
   * Get analytics summary
   */
  getSummary() {
    const stats = this.getSessionStats();
    
    return {
      sessionDuration: stats.duration,
      totalActions: Object.values(stats.behavior).reduce((sum, b) => sum + b.count, 0),
      totalErrors: Object.values(stats.errors).reduce((sum, e) => sum + e.count, 0),
      totalFeatures: Object.values(stats.features).reduce((sum, f) => sum + f.count, 0),
      mostUsedFeature: this.getMostUsedFeature(),
      averageResponseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate()
    };
  }

  /**
   * Get most used feature
   */
  getMostUsedFeature() {
    let mostUsed = null;
    let maxCount = 0;

    for (const [name, features] of this.metrics.features) {
      if (features.length > maxCount) {
        maxCount = features.length;
        mostUsed = name;
      }
    }

    return mostUsed;
  }

  /**
   * Get average response time
   */
  getAverageResponseTime() {
    const responseTimes = this.metrics.performance.get('response_time') || [];
    if (responseTimes.length === 0) return 0;

    const values = responseTimes.map(m => m.value);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get error rate
   */
  getErrorRate() {
    const totalActions = Object.values(this.getSessionStats().behavior)
      .reduce((sum, b) => sum + b.count, 0);
    const totalErrors = Object.values(this.getSessionStats().errors)
      .reduce((sum, e) => sum + e.count, 0);

    return totalActions > 0 ? (totalErrors / totalActions) * 100 : 0;
  }
}

module.exports = { AnalyticsService };
