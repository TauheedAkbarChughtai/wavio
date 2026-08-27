import { Stack, useSegments } from "expo-router";
import { DownloadModalProvider } from "@/components/search/DownloadFormatModal";

export default function AppLayout() {
  return (
    <DownloadModalProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="profile/[username]" />
        <Stack.Screen
          name="player"
          options={{
            presentation: "fullScreenModal",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="lyrics" />
        <Stack.Screen name="playlists/new" />
        <Stack.Screen name="playlists/new-smart" />
        <Stack.Screen name="playlists/[id]/edit-rules" />
        <Stack.Screen name="internet-radio-stations/new" />
        <Stack.Screen name="podcast-channels/new" />
      </Stack>
    </DownloadModalProvider>
  );
}
