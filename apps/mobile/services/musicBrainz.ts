import axios from 'axios';
import { Child } from './openSubsonic/types';

const mbClient = axios.create({
  baseURL: 'https://musicbrainz.org/ws/2/',
  headers: {
    'User-Agent': 'WavioMobileApp/1.0 (tauheedakbarchughtai@gmail.com)'
  }
});

export async function searchMusicBrainz(query: string): Promise<Child[]> {
  try {
    const term = encodeURIComponent(query);
    const response = await mbClient.get(`recording/?query=${term}&fmt=json&limit=15`);
    const recordings = response.data?.recordings || [];

    return recordings.map((r: any) => ({
      id: `mb:${r.id}`,
      musicBrainzId: r.id,
      title: r.title,
      artist: r['artist-credit']?.[0]?.name || 'Unknown Artist',
      album: r.releases?.[0]?.title || 'Unknown Album',
      isDir: false,
      isOwned: false,
      duration: r.length ? Math.floor(r.length / 1000) : 0,
      coverArt: '',
    }));
  } catch (error) {
    console.error('MusicBrainz Search Error:', error);
    return [];
  }
}
