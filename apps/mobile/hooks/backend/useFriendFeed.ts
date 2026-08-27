import { useQuery } from '@tanstack/react-query';
import { fetchFriendHeavyRotation } from '@/services/friendFeedApi';
import { useAuthBase } from '@/stores/auth';

export function useFriendHeavyRotation() {
  const username = useAuthBase((s) => s.username);
  const friendName = username === 'Tauheed' ? 'saramara' : 'Tauheed';

  return useQuery({
    queryKey: ['friendFeed', 'heavyRotation', friendName],
    queryFn: fetchFriendHeavyRotation,
    staleTime: 5 * 60 * 1000,
    enabled: !!username,
  });
}
