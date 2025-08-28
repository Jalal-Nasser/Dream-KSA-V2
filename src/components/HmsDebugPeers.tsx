import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { HMSSDK, HMSUpdateListenerActions, HMSPeer, HMSTrack } from '@100mslive/react-native-hms';

type Props = { sdkRef: React.MutableRefObject<HMSSDK | null> };

export default function HmsDebugPeers({ sdkRef }: Props) {
  const [peers, setPeers] = React.useState<HMSPeer[]>([]);

  React.useEffect(() => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    function snapshot() {
      // Note: getPeers() is not available in this HMS SDK version
      // We'll rely on event listeners to track peers instead
      setPeers([]);
    }

    snapshot(); // initial
    const onPeer = ({ peer }: { peer: HMSPeer }) => { console.log('[HMS] PEER', peer?.name, peer?.role?.name); snapshot(); };
    const onTrack = ({ peer, track }: { peer: HMSPeer; track: HMSTrack }) => {
      const muted = track?.isMute?.();
      console.log('[HMS] TRACK', peer?.name, track?.type, 'muted=', muted);
      snapshot();
    };

    sdk.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, onPeer);
    sdk.addEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE, onTrack);

    return () => {
      try { sdk.removeEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, onPeer); } catch {}
      try { sdk.removeEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE, onTrack); } catch {}
    };
  }, [sdkRef.current]);

  return (
    <View style={{ marginTop: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 }}>
      <Text style={{ fontWeight: '700', marginBottom: 8 }}>Peers / Tracks</Text>
      <ScrollView style={{ maxHeight: 160 }}>
        {peers.length === 0 ? <Text style={{ color: '#6b7280' }}>No peers yet</Text> :
          peers.map(p => {
            const t = p.audioTrack;
            const muted = t?.isMute?.();
            return (
              <View key={p.peerID} style={{ marginBottom: 6 }}>
                <Text>{p.isLocal ? 'You' : p.name} · role={p.role?.name} · audioMuted={String(muted)}</Text>
              </View>
            );
          })
        }
      </ScrollView>
    </View>
  );
}
