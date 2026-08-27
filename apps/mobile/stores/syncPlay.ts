import { create } from 'zustand';

interface SyncPlayState {
  isSyncActive: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  toggleSync: () => void;
  setStatus: (status: 'disconnected' | 'connecting' | 'connected') => void;
}

export const useSyncPlayStore = create<SyncPlayState>((set) => ({
  isSyncActive: false,
  connectionStatus: 'disconnected',
  toggleSync: () => set((state) => ({ isSyncActive: !state.isSyncActive })),
  setStatus: (status) => set({ connectionStatus: status }),
}));
