import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import AlbumListItem from '@/components/albums/AlbumListItem';
import HomeSection from '@/components/home/sections/HomeSection';
import { useFriendHeavyRotation } from '@/hooks/backend/useFriendFeed';
import { useAuthBase } from '@/stores/auth';
import type { AlbumID3 } from '@/services/openSubsonic/types';
import { loadingData } from '@/utils/loadingData';
import { Box } from '@/components/ui/box';

export default function FriendRotationSection() {
  const { t } = useTranslation();
  const { data, isLoading } = useFriendHeavyRotation();
  const username = useAuthBase((s) => s.username);
  const friendName = username === 'Tauheed' ? 'saramara' : 'Tauheed';

  const displayData = isLoading ? loadingData(10) : data || [];

  if (!isLoading && displayData.length === 0) {
    return null;
  }

  return (
    <HomeSection
      title={`${friendName}'s Heavy Rotation`}
      isLoading={isLoading}
      isEmpty={!isLoading && displayData.length === 0}
      skeleton={<Box />}
    >
      <Box className="w-full">
        <FlatList
          horizontal
          data={displayData as AlbumID3[]}
          renderItem={({ item, index }) => (
             <AlbumListItem album={item} index={index} layout="horizontal" />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }}
        />
      </Box>
    </HomeSection>
  );
}
