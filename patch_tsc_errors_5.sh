sed -i '' 's/topSongsData?.topSongs.song/topSongsData?.song/g' apps/mobile/components/artists/ArtistDetail.tsx
sed -i '' 's/topSongsData?.topSongs?.song/topSongsData?.song/g' apps/mobile/components/artists/ArtistDetail.tsx
sed -i '' 's/song, index/song: any, index: number/g' apps/mobile/components/artists/ArtistDetail.tsx
