import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlaylists } from '@/hooks/backend/usePlaylists';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Image } from 'expo-image';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FadeOutScaleDown from '@/components/FadeOutScaleDown';
import { LinearGradient } from 'expo-linear-gradient';

const EXPLO_WEEKLY_ID = 'EXPLO_WEEKLY';
const EXPLO_DAILY_ID = 'EXPLO_DAILY';

export default function DiscoverIndex() {
  const { data: playlists } = usePlaylists({} as any) as any;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Try to find the Explo playlists (owner will configure these later, so we provide resilient fallbacks)
  const discoveryPlaylists = playlists?.filter((p: any) => p.id === EXPLO_WEEKLY_ID || p.id === EXPLO_DAILY_ID) || [];

  // Fallback to any two playlists if specific ones not found, or empty state
  const displayList = discoveryPlaylists.length > 0 ? discoveryPlaylists : playlists?.slice(0, 2) || [];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 100, paddingHorizontal: 24 }}>
      <Heading size="2xl" className="text-white font-bold mb-8">Discover</Heading>

      {displayList.map((playlist: any, idx: number) => (
        <Box key={playlist.id} style={{ height: 250, marginBottom: 32 }}>
        <FadeOutScaleDown
          onPress={() => router.push(`/playlists/${playlist.id}`)}
          className="overflow-hidden rounded-2xl bg-black relative flex-1"
        >
          {playlist.coverArt ? (
             <Image
               source={{ uri: `/rest/getCoverArt.view?id=${playlist.coverArt}` }}
               style={StyleSheet.absoluteFill}
               contentFit="cover"
             />
          ) : (
             <Box style={[StyleSheet.absoluteFill, { backgroundColor: idx % 2 === 0 ? '#10b981' : '#3b82f6' }]} />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={[StyleSheet.absoluteFill, { top: '50%' }]}
          />
          <Box className="absolute bottom-6 left-6 right-6">
            <Heading size="xl" className="text-white mb-2">{playlist.name}</Heading>
            <Heading size="md" className="text-gray-300">Curated for you • {playlist.songCount} songs</Heading>
          </Box>
        </FadeOutScaleDown>
        </Box>
      ))}

      {displayList.length === 0 && (
        <Heading size="md" className="text-gray-400 mt-12 text-center">Your discovery engine is calibrating.</Heading>
      )}
    </ScrollView>
  );
}
