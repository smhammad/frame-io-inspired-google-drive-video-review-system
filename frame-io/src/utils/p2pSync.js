// P2P synchronization using WebRTC
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

  // Initialize P2P connections
  async init() {
    try {
      // Listen for hash changes for signaling
      window.addEventListener('hashchange', () => this._handleHashChange());
      
      // Check if we're joining an existing room
      if (window.location.hash) {
        await this._handleHashChange();
      } else {
        // Create new room
        this._updateHash({
          roomId: this.roomId,
          peerId: this.peerId,
          offer: null
        });
      }
    } catch (err) {
      console.error('P2P init error:', err);
    }
  }

  // Send data to all connected peers
  broadcast(data) {
    const message = JSON.stringify(data);
    this.peers.forEach(conn => {
      try {
        conn.dataChannel.send(message);
      } catch (err) {
        console.error('Failed to send to peer:', err);
      }
    });
  }

  // Create WebRTC offer
  async _createOffer(targetPeerId) {
    const pc = new RTCPeerConnection(this.config);
    
    // Create data channel
    const dc = pc.createDataChannel('comments');
    this._setupDataChannel(dc);
    
    // Create and set local description
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    // Store connection
    this.peers.set(targetPeerId, { pc, dataChannel: dc });
    
    return pc.localDescription;
  }

  // Handle incoming WebRTC answer
  async _handleAnswer(peerId, answer) {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    
    try {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error('Error setting remote description:', err);
    }
  }

  // Accept WebRTC offer
  async _acceptOffer(peerId, offer) {
    const pc = new RTCPeerConnection(this.config);
    
    // Handle data channel
    pc.ondatachannel = (event) => {
      this._setupDataChannel(event.channel);
      this.peers.set(peerId, { pc, dataChannel: event.channel });
    };
    
    // Set remote description and create answer
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    return pc.localDescription;
  }

  // Set up data channel handlers
  _setupDataChannel(dc) {
    dc.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessage) this.onMessage(data);
      } catch (err) {
        console.error('Error handling message:', err);
      }
    };
    
    dc.onopen = () => {
      console.log('P2P connection established');
      if (this.onPeerJoin) this.onPeerJoin();
    };
    
    dc.onclose = () => {
      if (this.onPeerLeave) this.onPeerLeave();
    };
  }

  // Handle URL hash changes for signaling
  async _handleHashChange() {
    try {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      
      const signal = JSON.parse(decodeURIComponent(hash));
      
      // Ignore our own signals
      if (signal.peerId === this.peerId) return;
      
      // Handle offers and create answer
      if (signal.offer && !signal.answer) {
        const answer = await this._acceptOffer(signal.peerId, signal.offer);
        
        // Update hash with our answer
        this._updateHash({
          roomId: this.roomId,
          peerId: this.peerId,
          offer: signal.offer,
          answer
        });
      }
      // Handle answers to our offers
      else if (signal.offer && signal.answer) {
        await this._handleAnswer(signal.peerId, signal.answer);
      }
      // New peer joining - create offer
      else if (!signal.offer && !signal.answer) {
        const offer = await this._createOffer(signal.peerId);
        
        // Update hash with our offer
        this._updateHash({
          roomId: this.roomId,
          peerId: this.peerId,
          offer
        });
      }
    } catch (err) {
      console.error('Error handling hash change:', err);
    }
  }

  // Update URL hash with signaling data
  _updateHash(data) {
    const hash = encodeURIComponent(JSON.stringify(data));
    window.location.hash = hash;
  }

  // Clean up connections
  destroy() {
    this.peers.forEach(({ pc, dataChannel }) => {
      try {
        dataChannel.close();
        pc.close();
      } catch (err) {
        console.error('Error closing peer connection:', err);
      }
    });
    this.peers.clear();
    window.location.hash = '';
  }
}