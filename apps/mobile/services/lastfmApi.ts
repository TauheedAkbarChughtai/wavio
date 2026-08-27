import axios from 'axios';
import { Child } from './openSubsonic/types';

const LAST_FM_API_KEY = '6cd2fcf091e607799bc6b31b5e365ca2';

const lastFmClient = axios.create({
  baseURL: 'https://ws.audioscrobbler.com/2.0/',
});

lastFmClient.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    api_key: LAST_FM_API_KEY,
    format: 'json',
  };
  return config;
});

export async function getArtistInfo(artist: string): Promise<string | null> {
  try {
    const response = await lastFmClient.get('', { params: { method: 'artist.getinfo', artist } });
    const bio = response.data?.artist?.bio?.content;
    if (!bio) return null;
    return bio.replace(/<a href=".*?">Read more on Last\.fm<\/a>/gi, '').trim();
  } catch (error) {
    console.error('LastFM getArtistInfo Error:', error);
    return null;
  }
}

export async function getArtistTopTracks(artist: string, limit = 15): Promise<Child[]> {
  try {
    const response = await lastFmClient.get('', { params: { method: 'artist.gettoptracks', artist, limit } });
    const tracks = response.data?.toptracks?.track || [];

    return tracks.map((t: any) => ({
      id: `lastfm:${t.name}`,
      title: t.name,
      artist: t.artist?.name || artist,
      isDir: false,
      isOwned: false,
      duration: t.duration ? parseInt(t.duration, 10) : 0,
      coverArt: '',
    }));
  } catch (error) {
    console.error('LastFM getArtistTopTracks Error:', error);
    return [];
  }
}
