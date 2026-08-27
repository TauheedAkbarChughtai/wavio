import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function TabVideoBackground({ activeTab }: { activeTab: string }) {
  const daySeed = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  const tabs = ['home', 'search', 'library', 'discover'];
  const tabIndex = tabs.indexOf(activeTab) !== -1 ? tabs.indexOf(activeTab) : 0;
  const videoIndex = (daySeed + tabIndex) % 4;

  const videoSources = [
    require('../assets/videos/bg1.mp4'),
    require('../assets/videos/bg2.mp4'),
    require('../assets/videos/bg3.mp4'),
    require('../assets/videos/bg4.mp4')
  ];

  const source = videoSources[videoIndex];

  const player = useVideoPlayer(source, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <VideoView
      style={[StyleSheet.absoluteFill, { zIndex: -10 }]}
      player={player}
      contentFit="cover"
    />
  );
}
