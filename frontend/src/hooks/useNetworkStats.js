import { useState, useEffect, useRef } from 'react';

/**
 * Polls WebRTC getStats every 3s across peer connections to monitor RTT, packet loss, and quality.
 * @param {Map<string, RTCPeerConnection>} peerConnectionsMap
 * @param {Function} onPoorConnection - callback when sustained packet loss or high RTT detected
 */
export const useNetworkStats = (peerConnectionsMap, onPoorConnection) => {
  const [networkStats, setNetworkStats] = useState({}); // { [peerId]: { rtt, packetLoss, rating: 1 | 2 | 3 } }
  const [overallQuality, setOverallQuality] = useState('good'); // 'good' | 'fair' | 'poor'
  const poorCountsRef = useRef(0);

  useEffect(() => {
    if (!peerConnectionsMap || peerConnectionsMap.size === 0) {
      setNetworkStats({});
      setOverallQuality('good');
      return;
    }

    const interval = setInterval(async () => {
      const currentStats = {};
      let maxRtt = 0;
      let maxPacketLoss = 0;

      for (const [peerId, pc] of peerConnectionsMap.entries()) {
        if (!pc || pc.connectionState === 'closed') continue;

        try {
          const stats = await pc.getStats();
          let rtt = 0;
          let packetLoss = 0;

          stats.forEach((report) => {
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              rtt = Math.round((report.currentRoundTripTime || 0) * 1000);
            }
            if (report.type === 'inbound-rtp' && (report.kind === 'video' || report.kind === 'audio')) {
              const lost = report.packetsLost || 0;
              const received = report.packetsReceived || 0;
              const total = lost + received;
              if (total > 0) {
                packetLoss = Math.round((lost / total) * 100);
              }
            }
          });

          // Quality rating: 3 = Good (green), 2 = Fair (yellow), 1 = Poor (red)
          let rating = 3;
          if (rtt > 350 || packetLoss > 10) {
            rating = 1;
          } else if (rtt > 180 || packetLoss > 3) {
            rating = 2;
          }

          currentStats[peerId] = { rtt, packetLoss, rating };

          if (rtt > maxRtt) maxRtt = rtt;
          if (packetLoss > maxPacketLoss) maxPacketLoss = packetLoss;
        } catch (e) {
          // stats error
        }
      }

      setNetworkStats(currentStats);

      let overall = 'good';
      if (maxRtt > 350 || maxPacketLoss > 8) {
        overall = 'poor';
        poorCountsRef.current += 1;
        if (poorCountsRef.current >= 2 && onPoorConnection) {
          onPoorConnection();
        }
      } else if (maxRtt > 180 || maxPacketLoss > 3) {
        overall = 'fair';
        poorCountsRef.current = 0;
      } else {
        poorCountsRef.current = 0;
      }

      setOverallQuality(overall);
    }, 3000);

    return () => clearInterval(interval);
  }, [peerConnectionsMap, onPoorConnection]);

  return { networkStats, overallQuality };
};

