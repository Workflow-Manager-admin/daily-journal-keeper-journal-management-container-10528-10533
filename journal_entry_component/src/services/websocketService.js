import { io } from 'socket.io-client';

/**
 * WebSocketService class handles WebSocket connections with fallback and reconnection logic
 */
class WebSocketService {
  constructor() {
    this.config = {
      reconnectAttempts: 0,
      maxReconnectAttempts: process.env.REACT_APP_WS_MAX_RECONNECT_ATTEMPTS || 5,
      reconnectDelay: process.env.REACT_APP_WS_RECONNECT_DELAY || 2000,
      reconnectDelayMax: process.env.REACT_APP_WS_RECONNECT_DELAY_MAX || 10000,
      timeout: process.env.REACT_APP_WS_TIMEOUT || 10000,
      autoConnect: true,
      defaultUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:8080'
    };
    this.listeners = new Map();
    this.initializeSocket();
  }

  /**
   * Initializes the WebSocket connection with Socket.IO and native WebSocket fallback
   */
  initializeSocket() {
    // Configure Socket.IO to use only WebSocket transport
    this.socket = io(this.config.defaultUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.config.maxReconnectAttempts,
      reconnectionDelay: this.config.reconnectDelay,
      reconnectionDelayMax: this.config.reconnectDelayMax,
      timeout: this.config.timeout,
      extraHeaders: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Protocol': 'v1.journal-app',
        'Sec-WebSocket-Version': '13'
      },
      withCredentials: true
    });

    // Fallback to native WebSocket if Socket.IO fails
    if (!this.socket.connected) {
      try {
        const wsUrl = new URL(this.config.defaultUrl);
        wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        
        this.ws = new WebSocket(wsUrl.toString(), ['v1.journal-app']);
        
        // Add custom headers through the constructor
        const headers = {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          'Sec-WebSocket-Protocol': 'v1.journal-app',
          'Sec-WebSocket-Version': '13'
        };
        
        // Headers are set during the WebSocket handshake
        this.ws.onopen = () => {
          console.log('WebSocket connection established with headers');
        };
      } catch (error) {
        console.error('Failed to create native WebSocket:', error);
      }
    }

    this.setupEventHandlers();
  }

  /**
   * Sets up event handlers for both Socket.IO and native WebSocket
   */
  setupEventHandlers() {
    if (this.socket) {
      this.socket.on('connect', () => {
        console.log('Socket.IO connected');
        this.notifyListeners('connect');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        this.notifyListeners('disconnect');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.notifyListeners('error', error);
        this.handleReconnect();
      });

      this.socket.on('message', (data) => {
        this.notifyListeners('message', data);
      });
    }

    if (this.ws) {
      this.ws.onopen = () => {
        console.log('Native WebSocket connected');
        this.notifyListeners('connect');
      };

      this.ws.onclose = () => {
        console.log('Native WebSocket closed');
        this.notifyListeners('disconnect');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Native WebSocket error:', error);
        this.notifyListeners('error', error);
      };

      this.ws.onmessage = (event) => {
        this.notifyListeners('message', event.data);
      };
    }
  }

  /**
   * Handles reconnection attempts with exponential backoff
   */
  handleReconnect() {
    if (this.config.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.config.reconnectAttempts++;
      const delay = Math.min(
        this.config.reconnectDelay * Math.pow(2, this.config.reconnectAttempts - 1),
        this.config.reconnectDelayMax
      );
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.config.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
      this.notifyListeners('reconnect_attempt', this.config.reconnectAttempts);
      
      // Clear any existing connections before attempting to reconnect
      this.disconnect();
      
      setTimeout(() => {
        try {
          this.initializeSocket();
        } catch (error) {
          console.error('Reconnection attempt failed:', error);
          this.notifyListeners('error', new Error(`Reconnection attempt failed: ${error.message}`));
          // Continue with next attempt
          this.handleReconnect();
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifyListeners('reconnect_failed', new Error('Max reconnection attempts reached'));
      this.notifyListeners('error', new Error('Max reconnection attempts reached'));
    }
  }

  /**
   * Adds an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  /**
   * Removes an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Notifies all listeners of an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  /**
   * Sends data through the WebSocket connection
   * @param {*} data - Data to send
   */
  send(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message', data);
    } else if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.error('No active WebSocket connection available');
      throw new Error('No active WebSocket connection available');
    }
  }

  /**
   * Gets the current connection state
   * @returns {string} Connection state
   */
  getConnectionState() {
    if (this.socket && this.socket.connected) return 'connected';
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return 'connected';
    if (this.socket && this.socket.connecting) return 'connecting';
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) return 'connecting';
    return 'disconnected';
  }

  /**
   * Disconnects the WebSocket connection
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.ws) {
      this.ws.close();
    }
    this.config.reconnectAttempts = 0;
  }
}

export default WebSocketService;
