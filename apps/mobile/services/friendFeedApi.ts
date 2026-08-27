import axios from 'axios';
import { useAuthBase } from '@/stores/auth';
import { computeSubsonicToken, generateSalt } from '@/services/openSubsonic/auth';
import { AlbumID3 } from '@/services/openSubsonic/types';

export async function fetchFriendHeavyRotation(): Promise<AlbumID3[]> {
  const { username, url } = useAuthBase.getState();

  if (!username || !url) return [];

  const isTauheed = username === 'Tauheed';
  const friendName = isTauheed ? 'saramara' : 'Tauheed';
  const friendPassword = isTauheed ? 'multansultan789' : 'ActuallyStrongPassword1!';

  const salt = generateSalt();
  const token = computeSubsonicToken(friendPassword, salt);

  const ghostClient = axios.create({
    baseURL: url,
    params: {
      u: friendName,
      t: token,
      s: salt,
      v: '1.16.1',
      c: 'WavioMobileApp',
      f: 'json',
    },
  });

  const response = await ghostClient.get('/rest/getAlbumList2.view', {
    params: {
      type: 'recent',
      size: 15,
    }
  });

  const albums = response.data?.subsonicResponse?.albumList2?.album || [];
  return Array.isArray(albums) ? albums : [albums];
}
