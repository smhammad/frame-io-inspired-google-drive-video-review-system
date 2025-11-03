import { P2PSync } from './p2pSync';

export class CommentSync {
  constructor(videoUrl) {
    this.storageKey = `comments-${btoa(videoUrl)}`;
    this.videoUrl = videoUrl;
    this.channel = new BroadcastChannel(this.storageKey);
    this.p2p = new P2PSync(this.storageKey);
    this.onUpdate = null;
  }

  async init() {
    try {
      // Get stored comments with validation
      const stored = localStorage.getItem(this.storageKey);
      let comments = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        comments = Array.isArray(parsed) ? parsed : [];
      }

      // Listen for updates from other tabs/windows
      this.channel.onmessage = (event) => {
        try {
          const { type, data } = event.data;
          // Validate that data is an array before updating
          if (type === 'update' && Array.isArray(data) && this.onUpdate) {
            this.onUpdate(data);
            // Forward to P2P peers
            this.p2p.broadcast({ type: 'update', data });
          }
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };

      // Initialize P2P sync
      await this.p2p.init();
      
      return comments;
    } catch (err) {
      console.error('Failed to initialize comment sync:', err);
      return [];
    }
  }

  _saveToStorage(comments) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(comments));
    } catch (err) {
      console.error('Failed to save to storage:', err);
    }
  }

  updateComments(comments) {
    try {
      // Ensure comments is an array
      const validComments = Array.isArray(comments) ? comments : [];
      
      // Save to localStorage
      this._saveToStorage(validComments);
      
      // Broadcast to other tabs/windows
      this.channel.postMessage({ type: 'update', data: validComments });
      
      // Broadcast to P2P peers
      this.p2p.broadcast({ type: 'update', data: validComments });
    } catch (err) {
      console.error('Failed to sync comments:', err);
    }
  }

  destroy() {
    this.channel.close();
    this.p2p.destroy();
  }
}