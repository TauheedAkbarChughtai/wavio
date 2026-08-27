import axios from 'axios';
import { useAuthBase } from '@/stores/auth';

export async function requestDownload(artist: string, title: string, format: 'MP3' | 'FLAC'): Promise<any> {
  const state = useAuthBase.getState();
  const agentUrl = state.url?.includes('192.168.100.93')
    ? 'http://192.168.100.93:4000'
    : 'https://agent.tauheedakbar.com';

  try {
    const response = await axios.post(`${agentUrl}/api/download`, {
      artist,
      title,
      format
    });
    return response.data;
  } catch (error: any) {
    return { status: 'error', message: error.message };
  }
}
