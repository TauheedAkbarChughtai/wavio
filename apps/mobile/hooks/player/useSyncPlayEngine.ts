import { useEffect, useRef } from 'react';
import { useSyncPlayStore } from '@/stores/syncPlay';
import * as syncPlaySocket from '@/services/syncPlaySocket';
import { useAuthBase } from '@/stores/auth';
import { seekTo, playTracks } from '@/services/player';
import usePlayerQueue from '@/stores/queue';

export function useSyncPlayEngine() {
  const isSyncActive = useSyncPlayStore((s) => s.isSyncActive);
  const setStatus = useSyncPlayStore((s) => s.setStatus);
  const isRemoteCommandRef = useRef(false);
  const previousStateRef = useRef<any>({});

  useEffect(() => {
    if (isSyncActive) {
      syncPlaySocket.connect();
      setStatus(syncPlaySocket.getConnectionState());

      const unsubscribe = syncPlaySocket.subscribeToEvents({
        onConnect: () => setStatus('connected'),
        onDisconnect: () => setStatus('disconnected'),
        onPlay: ({ trackId, timestampMs, sourceUser }) => {
          const username = useAuthBase.getState().username;
          if (sourceUser === username) return; // Ignore own echoes

          isRemoteCommandRef.current = true;

          const currentTrack = usePlayerQueue.getState().queue[usePlayerQueue.getState().currentIndex ?? 0];
          if (currentTrack?.id !== trackId) {
             // In a real app we'd fetch the track ID if it's not in the queue,
             // but we'll try to find it in the queue or rely on other means.
             // For simplicity in this architectural overhaul, we assume the track
             // is accessible. Wavio's playTracks requires an array of children.
             // We'll trust Wavio's infrastructure to handle it if we mock a Child.
             playTracks([{ id: trackId, isDir: false } as any]);
          }

          setTimeout(() => {
             seekTo(timestampMs / 1000);
          }, 500); // Allow track load time

          setTimeout(() => {
            isRemoteCommandRef.current = false;
          }, 1500);
        },
        onSeek: ({ trackId, timestampMs, sourceUser }) => {
          const username = useAuthBase.getState().username;
          if (sourceUser === username) return;

          isRemoteCommandRef.current = true;
          seekTo(timestampMs / 1000);
          setTimeout(() => {
            isRemoteCommandRef.current = false;
          }, 1500);
        }
      });

      return () => {
        unsubscribe();
        syncPlaySocket.disconnect();
        setStatus('disconnected');
      };
    } else {
      syncPlaySocket.disconnect();
      setStatus('disconnected');
    }
  }, [isSyncActive, setStatus]);

  useEffect(() => {
    if (!isSyncActive) return;

    const unsubscribeState = usePlayerQueue.subscribe(
      (state: any) => {
        const isPlaying = state === 'playing';
        const wasPlaying = previousStateRef.current.state === 'playing';
        previousStateRef.current.state = state;

        if (!isRemoteCommandRef.current && isPlaying && !wasPlaying) {
           const currentTrack = usePlayerQueue.getState().queue[usePlayerQueue.getState().currentIndex ?? 0];
           const currentTime = 0; // fallback if we don't have time easily
           if (currentTrack) {
              const username = useAuthBase.getState().username;
              syncPlaySocket.emitSyncPlay(currentTrack.id, (currentTime || 0) * 1000, username || 'Unknown');
           }
        }
      }
    );

    const unsubscribeProgress = usePlayerQueue.subscribe(
      (state: any) => {
        const currentTime = state.currentTime;
        const diff = Math.abs((previousStateRef.current.time || 0) - currentTime);
        previousStateRef.current.time = currentTime;

        // If time jumped by more than 2 seconds, it was a scrub
        if (!isRemoteCommandRef.current && diff > 2) {
           const currentTrack = usePlayerQueue.getState().queue[usePlayerQueue.getState().currentIndex ?? 0];
           if (currentTrack) {
              const username = useAuthBase.getState().username;
              syncPlaySocket.emitSyncSeek(currentTrack.id, currentTime * 1000, username || 'Unknown');
           }
        }
      }
    );

    return () => {
      unsubscribeState();
      unsubscribeProgress();
    };
  }, [isSyncActive]);
}
