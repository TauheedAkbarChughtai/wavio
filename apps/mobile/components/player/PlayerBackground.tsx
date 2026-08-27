import React from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Box } from '@/components/ui/box';

export default function PlayerBackground({ artworkUrl, children }: { artworkUrl?: string; children: React.ReactNode }) {
  return (
    <Box style={StyleSheet.absoluteFill}>
      {artworkUrl ? (
        <Image
          source={{ uri: artworkUrl }}
          style={StyleSheet.absoluteFill}
          blurRadius={90}
          contentFit="cover"
        />
      ) : (
        <Box style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]} />
      )}
      <Box style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
      <Image
        source={require('../../assets/images/grain.png')}
        style={[StyleSheet.absoluteFill, { opacity: 0.15 }]}
        contentFit="cover"
        pointerEvents="none"
      />
      {children}
    </Box>
  );
}
