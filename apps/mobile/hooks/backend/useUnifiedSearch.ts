import { useQuery } from '@tanstack/react-query';
import { searchMusicBrainz } from '@/services/musicBrainz';
import { search3 } from '@/services/backend/searching';

// Helper hook combining local search and MusicBrainz search
export function useUnifiedSearch(query: string, limit: number = 15) {
  return useQuery({
    queryKey: ['unifiedSearch', query, limit],
    queryFn: async () => {
      if (!query.trim()) return { song: [], album: [], artist: [] };

      const [localResults, mbResults] = await Promise.allSettled([
        search3(query, { songCount: limit, albumCount: limit, artistCount: limit }),
        searchMusicBrainz(query),
      ]);

      const localData: any = localResults.status === 'fulfilled' ? localResults.value : { song: [], album: [], artist: [] };
      const mbData = mbResults.status === 'fulfilled' ? mbResults.value : [];

      const safeLocalSongs = localData.song || [];

      // Deduplicate MB results if they already exist in the local library
      const mergedSongs = [...safeLocalSongs];

      for (const mbTrack of mbData) {
         const existsLocally = safeLocalSongs.some(
            (localTrack: any) =>
               localTrack.title.toLowerCase() === mbTrack.title.toLowerCase() &&
               localTrack.artist?.toLowerCase() === mbTrack.artist?.toLowerCase()
         );

         if (!existsLocally) {
            mergedSongs.push(mbTrack);
         }
      }

      return {
        song: mergedSongs,
        album: localData.album || [],
        artist: localData.artist || [],
      };
    },
    enabled: query.length > 1,
  });
}
