import { P2PSync } from './p2pSync';

// Utility for syncing comments across tabs/windows and P2P connections
export class CommentSync {
  constructor(videoUrl) {
    // Create a unique key based on the video URL
    this.storageKey = `comments-${btoa(videoUrl)}`;
    this.videoUrl = videoUrl;
    
    // Initialize broadcast channel for real-time sync between tabs
    this.channel = new BroadcastChannel(this.storageKey);
    
    // Initialize P2P sync for cross-device communication
    this.p2p = new P2PSync(this.storageKey);
    
    // Callbacks
    this.onUpdate = null;
  }

  // Initialize sync and return stored comments
  async init() {
    try {
      // Get stored comments
      const stored = localStorage.getItem(this.storageKey);
      const comments = stored ? JSON.parse(stored) : [];

      // Listen for updates from other tabs/windows
      this.channel.onmessage = (event) => {
        const { type, data } = event.data;
        if (type === 'update' && this.onUpdate) {
          this.onUpdate(data);
          // Forward to P2P peers
          this.p2p.broadcast({ type: 'update', data });
        }
      };

      // Set up P2P sync
      await this.p2p.init();
      this.p2p.onMessage = (data) => {
        if (data.type === 'update' && this.onUpdate) {
          this.onUpdate(data.data);
          this._saveToStorage(data.data);
        }
      };

      // When a new peer joins, send them the current comments
      this.p2p.onPeerJoin = () => {
        const currentComments = localStorage.getItem(this.storageKey);
        if (currentComments) {
          this.p2p.broadcast({
            type: 'update',
            data: JSON.parse(currentComments)
          });
        }
      };

      return comments;
    } catch (err) {
      console.error('Failed to initialize comment sync:', err);
      return [];
    }
  }

  // Save comments to localStorage
  _saveToStorage(comments) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(comments));
    } catch (err) {
      console.error('Failed to save to storage:', err);
    }
  }

  // Update comments and notify all sync channels
  updateComments(comments) {
    try {
      // Save to localStorage
      this._saveToStorage(comments);
      
      // Broadcast to other tabs/windows
      this.channel.postMessage({ type: 'update', data: comments });
      
      // Broadcast to P2P peers
      this.p2p.broadcast({ type: 'update', data: comments });
    } catch (err) {
      console.error('Failed to sync comments:', err);
    }
  }

  // Clean up
  destroy() {
    this.channel.close();
    this.p2p.destroy();
  }
}