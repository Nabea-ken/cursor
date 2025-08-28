const EventEmitter = require('events');
const crypto = require('crypto');

class CollaborationService extends EventEmitter {
  constructor() {
    super();
    this.rooms = new Map();
    this.users = new Map();
    this.sessions = new Map();
    this.isInitialized = false;
    this.userId = null;
    this.userName = null;
  }

  /**
   * Initialize collaboration service
   */
  async initialize(config = {}) {
    try {
      this.userId = config.userId || this.generateUserId();
      this.userName = config.userName || 'Anonymous';
      
      this.isInitialized = true;
      console.log('Collaboration service initialized');
      
      return { success: true, userId: this.userId };
    } catch (error) {
      console.error('Collaboration initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate unique user ID
   */
  generateUserId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create a collaboration room
   */
  async createRoom(roomConfig) {
    const roomId = this.generateRoomId();
    const room = {
      id: roomId,
      name: roomConfig.name || 'Untitled Room',
      type: roomConfig.type || 'code', // 'code', 'chat', 'ai'
      filePath: roomConfig.filePath,
      owner: this.userId,
      users: [this.userId],
      createdAt: new Date(),
      settings: {
        allowEdit: roomConfig.allowEdit !== false,
        allowChat: roomConfig.allowChat !== false,
        allowAI: roomConfig.allowAI !== false,
        maxUsers: roomConfig.maxUsers || 10
      },
      messages: [],
      changes: [],
      aiContext: roomConfig.aiContext || {}
    };

    this.rooms.set(roomId, room);
    this.joinRoom(roomId);
    
    this.emit('roomCreated', room);
    return { success: true, room };
  }

  /**
   * Generate unique room ID
   */
  generateRoomId() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Join a collaboration room
   */
  async joinRoom(roomId, password = null) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.users.length >= room.settings.maxUsers) {
      return { success: false, error: 'Room is full' };
    }

    if (!room.users.includes(this.userId)) {
      room.users.push(this.userId);
    }

    // Add user to room's user list
    const userInfo = {
      id: this.userId,
      name: this.userName,
      joinedAt: new Date(),
      isOnline: true
    };

    this.users.set(this.userId, userInfo);
    
    this.emit('userJoined', { roomId, user: userInfo });
    this.emit('roomJoined', room);
    
    return { success: true, room };
  }

  /**
   * Send a message to a room
   */
  async sendMessage(roomId, message) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (!room.settings.allowChat) {
      return { success: false, error: 'Chat is disabled in this room' };
    }

    const messageObj = {
      id: crypto.randomBytes(8).toString('hex'),
      roomId,
      userId: this.userId,
      userName: this.userName,
      content: message.content,
      type: message.type || 'text', // 'text', 'code', 'ai', 'system'
      timestamp: new Date(),
      metadata: message.metadata || {}
    };

    room.messages.push(messageObj);
    
    this.emit('messageReceived', messageObj);
    return { success: true, message: messageObj };
  }

  /**
   * Share code changes in a room
   */
  async shareCodeChange(roomId, change) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (!room.settings.allowEdit) {
      return { success: false, error: 'Editing is disabled in this room' };
    }

    const changeObj = {
      id: crypto.randomBytes(8).toString('hex'),
      roomId,
      userId: this.userId,
      userName: this.userName,
      filePath: change.filePath,
      position: change.position,
      text: change.text,
      type: change.type, // 'insert', 'delete', 'replace'
      timestamp: new Date(),
      version: change.version || 1
    };

    room.changes.push(changeObj);
    
    this.emit('codeChange', changeObj);
    return { success: true, change: changeObj };
  }

  /**
   * Request AI assistance in a room
   */
  async requestAIAssistance(roomId, request) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (!room.settings.allowAI) {
      return { success: false, error: 'AI assistance is disabled in this room' };
    }

    const aiRequest = {
      id: crypto.randomBytes(8).toString('hex'),
      roomId,
      userId: this.userId,
      userName: this.userName,
      prompt: request.prompt,
      context: request.context || room.aiContext,
      type: request.type || 'general', // 'code', 'explain', 'refactor', 'debug'
      timestamp: new Date()
    };

    // Emit AI request event
    this.emit('aiRequest', aiRequest);
    
    return { success: true, request: aiRequest };
  }

  /**
   * Get room information
   */
  async getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const users = room.users.map(userId => this.users.get(userId)).filter(Boolean);
    
    return {
      success: true,
      room: {
        ...room,
        users,
        messageCount: room.messages.length,
        changeCount: room.changes.length
      }
    };
  }

  /**
   * Get all rooms
   */
  async getAllRooms() {
    const rooms = Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      type: room.type,
      userCount: room.users.length,
      createdAt: room.createdAt,
      owner: room.owner
    }));
    
    return { success: true, rooms };
  }

  /**
   * Get room messages
   */
  async getRoomMessages(roomId, limit = 50, offset = 0) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const messages = room.messages
      .slice(offset, offset + limit)
      .reverse();
    
    return { success: true, messages };
  }

  /**
   * Update room settings
   */
  async updateRoomSettings(roomId, settings) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.owner !== this.userId) {
      return { success: false, error: 'Only room owner can update settings' };
    }

    room.settings = { ...room.settings, ...settings };
    
    this.emit('roomSettingsUpdated', { roomId, settings: room.settings });
    return { success: true, settings: room.settings };
  }

  /**
   * Get collaboration statistics
   */
  async getCollaborationStats() {
    const stats = {
      totalRooms: this.rooms.size,
      totalUsers: this.users.size,
      totalSessions: this.sessions.size,
      activeUsers: Array.from(this.users.values()).filter(u => u.isOnline).length,
      totalMessages: Array.from(this.rooms.values()).reduce((sum, room) => sum + room.messages.length, 0),
      totalChanges: Array.from(this.rooms.values()).reduce((sum, room) => sum + room.changes.length, 0)
    };
    
    return { success: true, stats };
  }

  /**
   * Disconnect from collaboration service
   */
  async disconnect() {
    this.isInitialized = false;
    this.emit('disconnected');
    
    return { success: true };
  }
}

module.exports = { CollaborationService };
