export class P2PSync {
  constructor(roomId) {
    this.roomId = roomId;
    this.peers = new Map(); // Store peer connections
    this.onMessage = null; // Callback for received messages
    this.onPeerJoin = null; // Callback for new peer connections
    this.onPeerLeave = null; // Callback for peer disconnections
    
    // ICE servers for NAT traversal (using free STUN servers)
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    };

    // Generate unique peer ID
    this.peerId = Math.random().toString(36).substr(2, 9);
    
    // Handle window/tab close
    window.addEventListener('beforeunload', () => this.destroy());
  }

  async init() {
    try {
      // Store hash in memory instead of URL
      this._currentHash = null;
      return true;
    } catch (err) {
      console.error('P2P init error:', err);
      return false;
    }
  }

  broadcast(data) {
    try {
      this.peers.forEach(conn => {
        try {
          if (conn.dataChannel?.readyState === 'open') {
            conn.dataChannel.send(JSON.stringify(data));
          }
        } catch (err) {
          console.error('Failed to send to peer:', err);
        }
      });
    } catch (err) {
      console.error('Broadcast error:', err);
    }
  }

  destroy() {
    try {
      this.peers.forEach(({ pc, dataChannel }) => {
        try {
          if (dataChannel) dataChannel.close();
          if (pc) pc.close();
        } catch (err) {
          console.error('Error closing peer connection:', err);
        }
      });
      this.peers.clear();
    } catch (err) {
      console.error('Error destroying P2P:', err);
    }
  }
}