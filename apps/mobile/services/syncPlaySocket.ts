import { io, Socket } from 'socket.io-client';
import { useAuthBase } from '@/stores/auth';

let socket: Socket | null = null;

export function connect() {
  const state = useAuthBase.getState();
  if (!state.url) return;

  const targetUrl = state.url.includes('192.168.100.93')
    ? 'http://192.168.100.93:4000'
    : 'https://agent.tauheedakbar.com';

  if (socket) {
    socket.disconnect();
  }

  socket = io(targetUrl, {
    transports: ['websocket'],
    reconnection: true,
  });

  socket.on('connect', () => {
    console.log('[SyncPlay] Connected to', targetUrl);
  });
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getConnectionState() {
  if (!socket) return 'disconnected';
  if (socket.connected) return 'connected';
  return 'connecting';
}

export function emitSyncPlay(trackId: string, timestampMs: number, sourceUser: string) {
  socket?.emit('sync_play', { trackId, timestampMs, sourceUser });
}

export function emitSyncPause(trackId: string, timestampMs: number, sourceUser: string) {
  socket?.emit('sync_pause', { trackId, timestampMs, sourceUser });
}

export function emitSyncSeek(trackId: string, timestampMs: number, sourceUser: string) {
  socket?.emit('sync_seek', { trackId, timestampMs, sourceUser });
}

export function subscribeToEvents(callbacks: {
  onPlay?: (payload: { trackId: string, timestampMs: number, sourceUser: string }) => void;
  onPause?: (payload: { trackId: string, timestampMs: number, sourceUser: string }) => void;
  onSeek?: (payload: { trackId: string, timestampMs: number, sourceUser: string }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}) {
  if (!socket) return () => {};

  const onPlayFn = (data: any) => callbacks.onPlay?.(data);
  const onPauseFn = (data: any) => callbacks.onPause?.(data);
  const onSeekFn = (data: any) => callbacks.onSeek?.(data);
  const onConnectFn = () => callbacks.onConnect?.();
  const onDisconnectFn = () => callbacks.onDisconnect?.();

  socket.on('sync_play', onPlayFn);
  socket.on('sync_pause', onPauseFn);
  socket.on('sync_seek', onSeekFn);
  socket.on('connect', onConnectFn);
  socket.on('disconnect', onDisconnectFn);

  return () => {
    socket?.off('sync_play', onPlayFn);
    socket?.off('sync_pause', onPauseFn);
    socket?.off('sync_seek', onSeekFn);
    socket?.off('connect', onConnectFn);
    socket?.off('disconnect', onDisconnectFn);
  };
}
