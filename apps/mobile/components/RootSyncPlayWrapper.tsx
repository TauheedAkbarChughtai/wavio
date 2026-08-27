import { useSyncPlayEngine } from '@/hooks/player/useSyncPlayEngine';

export default function RootSyncPlayWrapper() {
  useSyncPlayEngine();
  return null;
}
