import { useTopSongs } from '@/hooks/backend/useBrowsing';
import { useLastFmTopTracks } from './useLastFm';
import { Child } from '@/services/openSubsonic/types';
import { useMemo } from 'react';

function normalizeString(str: string) {
  return str.toLowerCase().replace(/\[.*?\]|\(.*?\)/g, '').replace(/[^a-z0-9]/g, '');
}

export function useMergedArtistTopTracks(artistName?: string) {
  const localQuery = useTopSongs(artistName ?? '', { count: 15 });
  const lastFmQuery = useLastFmTopTracks(artistName);

  const mergedData = useMemo(() => {
    if (!lastFmQuery.data && !localQuery.data) return undefined;

    const localTracks: any = (localQuery.data as any)?.song || [];
    const lastFmTracks = lastFmQuery.data || [];

    const merged: Child[] = [];
    const usedLocalIds = new Set<string>();

    for (const lfTrack of lastFmTracks) {
      const normalizedLfTitle = normalizeString(lfTrack.title);
      const matchingLocal = localTracks.find((lt: any) => normalizeString(lt.title) === normalizedLfTitle);

      if (matchingLocal) {
        merged.push({ ...matchingLocal, isOwned: true });
        usedLocalIds.add(matchingLocal.id);
      } else {
        merged.push(lfTrack);
      }
    }

    // Append local tracks not found in Last.fm
    for (const lt of localTracks) {
      if (!usedLocalIds.has((lt as any).id)) {
        merged.push({ ...(lt as any), isOwned: true });
      }
    }

    return { song: merged };
  }, [localQuery.data, lastFmQuery.data]);

  return {
    data: mergedData,
    isLoading: localQuery.isLoading || lastFmQuery.isLoading,
    isError: localQuery.isError || lastFmQuery.isError,
  };
}
