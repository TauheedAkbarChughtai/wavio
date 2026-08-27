import React from 'react';
import { useSyncPlayStore } from '@/stores/syncPlay';
import FadeOutScaleDown from '@/components/FadeOutScaleDown';
import Users from 'lucide-react-native/dist/esm/icons/users.mjs';
import { Uniwind } from 'uniwind';
import { View } from 'react-native';

export default function SyncPlayToggle() {
  const isSyncActive = useSyncPlayStore((s) => s.isSyncActive);
  const toggleSync = useSyncPlayStore((s) => s.toggleSync);
  const [gray200, emerald500] = Uniwind.getCSSVariable([
    "--color-gray-200",
    "--color-emerald-500",
  ]) as string[];

  return (
    <FadeOutScaleDown onPress={toggleSync} className="p-2 relative">
      <Users size={24} color={isSyncActive ? emerald500 : gray200} />
      {isSyncActive && (
        <View
          className="absolute right-1 top-1 w-2 h-2 rounded-full bg-emerald-500"
          style={{ shadowColor: emerald500, shadowOpacity: 0.8, shadowRadius: 4 }}
        />
      )}
    </FadeOutScaleDown>
  );
}
