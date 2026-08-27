import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { useAuthBase } from '@/stores/auth';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Image } from 'expo-image';

export default function ThemedCardBackground() {
  const username = useAuthBase((s) => s.username);
  const isTauheed = username === 'Tauheed';

  if (isTauheed) {
    return (
      <Box style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(6, 78, 59, 1)', 'rgba(64, 46, 21, 1)']}
          style={StyleSheet.absoluteFill}
        />
        <Image
          source={require('../assets/images/grain.png')}
          style={[StyleSheet.absoluteFill, { opacity: 0.15 }]}
          contentFit="cover"
          pointerEvents="none"
        />
      </Box>
    );
  }

  // Saramara
  return (
    <Box style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['rgba(15, 23, 42, 1)', 'rgba(49, 10, 89, 1)']}
        style={StyleSheet.absoluteFill}
      />
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Render a few scattered white dots as stars */}
        {[...Array(15)].map((_, i) => (
          <Circle
            key={i}
            cx={`${Math.random() * 100}%`}
            cy={`${Math.random() * 100}%`}
            r={Math.random() * 1.5 + 0.5}
            fill="rgba(255, 255, 255, 0.7)"
          />
        ))}
      </Svg>
    </Box>
  );
}
