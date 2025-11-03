// Utility for syncing comments across tabs/windows using BroadcastChannel
export class CommentSync {
  constructor(videoUrl) {
    // Create a unique key based on the video URL
    this.storageKey = `comments-${btoa(videoUrl)}`;
    
    // Initialize broadcast channel for real-time sync
    this.channel = new BroadcastChannel(this.storageKey);
    
    // Callbacks
    this.onUpdate = null;
  }

  // Initialize sync and return stored comments
  init() {
    try {
      // Get stored comments
      const stored = localStorage.getItem(this.storageKey);
      const comments = stored ? JSON.parse(stored) : [];

      // Listen for updates from other tabs/windows
      this.channel.onmessage = (event) => {
        const { type, data } = event.data;
        if (type === 'update' && this.onUpdate) {
          this.onUpdate(data);
        }
      };

      return comments;
    } catch (err) {
      console.error('Failed to initialize comment sync:', err);
      return [];
    }
  }

  // Update comments and notify other tabs/windows
  updateComments(comments) {
    try {
      // Store in localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(comments));
      
      // Broadcast to other tabs/windows
      this.channel.postMessage({ type: 'update', data: comments });
    } catch (err) {
      console.error('Failed to sync comments:', err);
    }
  }

  // Clean up
  destroy() {
    this.channel.close();
  }
}