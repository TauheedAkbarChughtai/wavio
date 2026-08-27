import { useQuery } from '@tanstack/react-query';
import { getArtistInfo, getArtistTopTracks } from '@/services/lastfmApi';

export function useLastFmArtistInfo(artistName?: string) {
  return useQuery({
    queryKey: ['lastfm', 'artistInfo', artistName],
    queryFn: () => getArtistInfo(artistName!),
    enabled: !!artistName,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useLastFmTopTracks(artistName?: string, limit = 15) {
  return useQuery({
    queryKey: ['lastfm', 'topTracks', artistName, limit],
    queryFn: () => getArtistTopTracks(artistName!, limit),
    enabled: !!artistName,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
