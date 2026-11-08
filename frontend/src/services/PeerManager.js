/**
 * PeerManager: Encapsulates WebRTC mesh connections with Perfect Negotiation pattern.
 * Manages RTCPeerConnections, ICE restarts, low-bandwidth rate limiting, and track replacement.
 */
export class PeerManager {
  /**
   * @param {Object} options
   * @param {string} options.myId - Local socket ID
   * @param {Array} options.iceServers - STUN/TURN servers
   * @param {Function} options.onSignal - Callback to emit signal to remote peer: (toId, signal, polite) => void
   * @param {Function} options.onRemoteTrack - Callback when remote track received: (peerId, track, stream) => void
   * @param {Function} options.onConnectionStateChange - (peerId, state) => void
   * @param {Function} options.onRequestIceRestart - (peerId) => void
   */
  constructor({ myId, iceServers, onSignal, onRemoteTrack, onConnectionStateChange, onRequestIceRestart }) {
    this.myId = myId;
    this.iceServers = iceServers || [{ urls: 'stun:stun.l.google.com:19302' }];
    this.onSignal = onSignal;
    this.onRemoteTrack = onRemoteTrack;
    this.onConnectionStateChange = onConnectionStateChange;
    this.onRequestIceRestart = onRequestIceRestart;

    /** @type {Map<string, RTCPeerConnection>} */
    this.peers = new Map();
    /** @type {Map<string, { makingOffer: boolean, ignoreOffer: boolean, isPolite: boolean }>} */
    this.states = new Map();
    /** @type {MediaStream | null} */
    this.localStream = null;
    /** @type {MediaStreamTrack | null} */
    this.screenTrack = null;
    /** @type {boolean} */
    this.isLowBandwidth = false;
  }

  setIceServers(servers) {
    if (Array.isArray(servers) && servers.length > 0) {
      this.iceServers = servers;
    }
  }

  setLocalStream(stream) {
    this.localStream = stream;
    // Update tracks in existing peer connections
    for (const [, pc] of this.peers.entries()) {
      const senders = pc.getSenders();
      stream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track && s.track.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track).catch((e) => console.warn('replaceTrack error:', e));
        } else {
          try {
            pc.addTrack(track, stream);
          } catch (e) {
            console.warn('addTrack error:', e);
          }
        }
      });
    }
  }

  /**
   * Initializes or returns a peer connection for the given remote peer.
   * Perfect negotiation: A peer is polite if its ID is alphabetically greater than the remote peer's ID.
   * @param {string} peerId 
   * @returns {RTCPeerConnection}
   */
  getOrCreatePeer(peerId) {
    if (this.peers.has(peerId)) {
      return this.peers.get(peerId);
    }

    // Deterministic politeness
    const isPolite = this.myId > peerId;

    const pc = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
    });

    const state = {
      makingOffer: false,
      ignoreOffer: false,
      isPolite,
    };

    this.peers.set(peerId, pc);
    this.states.set(peerId, state);

    // Add local tracks if available
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, this.localStream);
        } catch (e) {
          console.warn('Error adding track to peer:', e);
        }
      });
    }

    // Perfect Negotiation: onnegotiationneeded
    pc.onnegotiationneeded = async () => {
      try {
        state.makingOffer = true;
        await pc.setLocalDescription();
        this.onSignal(peerId, { sdp: pc.localDescription }, isPolite);
      } catch (err) {
        console.error(`[Peer ${peerId}] Negotiation error:`, err);
      } finally {
        state.makingOffer = false;
      }
    };

    // ICE Candidate generation
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.onSignal(peerId, { candidate }, isPolite);
      }
    };

    // Remote track arrival
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.onRemoteTrack(peerId, event.track, remoteStream || new MediaStream([event.track]));
    };

    // Connection state monitoring & auto-reconnect
    pc.oniceconnectionstatechange = () => {
      const iceState = pc.iceConnectionState;
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(peerId, iceState);
      }

      if (iceState === 'failed' || iceState === 'disconnected') {
        console.warn(`[Peer ${peerId}] ICE state ${iceState}, requesting ICE restart...`);
        this.restartIce(peerId);
      }
    };

    return pc;
  }

  /**
   * Handles incoming signaling messages (offers, answers, candidates)
   * via Perfect Negotiation logic.
   */
  async handleSignal(peerId, { sdp, candidate }, remotePolite) {
    const pc = this.getOrCreatePeer(peerId);
    const state = this.states.get(peerId);

    try {
      if (sdp) {
        const offerCollision = sdp.type === 'offer' && (state.makingOffer || pc.signalingState !== 'stable');
        state.ignoreOffer = !state.isPolite && offerCollision;

        if (state.ignoreOffer) {
          console.log(`[Peer ${peerId}] Impolite peer collision: Ignoring offer.`);
          return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        if (sdp.type === 'offer') {
          await pc.setLocalDescription();
          this.onSignal(peerId, { sdp: pc.localDescription }, state.isPolite);
        }
      } else if (candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          if (!state.ignoreOffer) {
            console.warn(`[Peer ${peerId}] addIceCandidate failed:`, err);
          }
        }
      }
    } catch (err) {
      console.error(`[Peer ${peerId}] Signal handling error:`, err);
    }
  }

  /**
   * Triggers an ICE restart for a specific peer
   * @param {string} peerId 
   */
  async restartIce(peerId) {
    const pc = this.peers.get(peerId);
    if (!pc) return;

    try {
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      const state = this.states.get(peerId);
      this.onSignal(peerId, { sdp: pc.localDescription }, state?.isPolite || false);
    } catch (err) {
      console.warn(`[Peer ${peerId}] restartIce error:`, err);
    }
  }

  /**
   * Applies bandwidth throttling across all video senders
   * @param {boolean} enableLowBandwidth 
   */
  async setLowBandwidthMode(enableLowBandwidth) {
    this.isLowBandwidth = enableLowBandwidth;
    for (const [, pc] of this.peers.entries()) {
      const senders = pc.getSenders();
      for (const sender of senders) {
        if (sender.track && sender.track.kind === 'video') {
          try {
            const parameters = sender.getParameters();
            if (!parameters.encodings || parameters.encodings.length === 0) {
              parameters.encodings = [{}];
            }
            if (enableLowBandwidth) {
              // Cap at 360p / 15fps / 200kbps
              parameters.encodings[0].maxBitrate = 200000;
              parameters.encodings[0].maxFramerate = 15;
              parameters.encodings[0].scaleResolutionDownBy = 2.0;
            } else {
              delete parameters.encodings[0].maxBitrate;
              delete parameters.encodings[0].maxFramerate;
              delete parameters.encodings[0].scaleResolutionDownBy;
            }
            await sender.setParameters(parameters);
          } catch (e) {
            console.warn('setParameters bandwidth throttle error:', e);
          }
        }
      }
    }
  }

  /**
   * Replaces current camera video track with screen track (or vice-versa)
   * @param {MediaStreamTrack | null} newVideoTrack 
   */
  async replaceVideoTrack(newVideoTrack) {
    for (const [, pc] of this.peers.entries()) {
      const senders = pc.getSenders();
      const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
      if (videoSender && newVideoTrack) {
        await videoSender.replaceTrack(newVideoTrack);
      }
    }
  }

  /**
   * Removes peer and closes connection
   * @param {string} peerId 
   */
  removePeer(peerId) {
    if (this.peers.has(peerId)) {
      const pc = this.peers.get(peerId);
      try {
        pc.close();
      } catch (e) {}
      this.peers.delete(peerId);
      this.states.delete(peerId);
    }
  }

  /**
   * Cleans up all connections and tracks
   */
  destroy() {
    for (const [peerId] of this.peers.entries()) {
      this.removePeer(peerId);
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.screenTrack) {
      this.screenTrack.stop();
      this.screenTrack = null;
    }
  }
}

