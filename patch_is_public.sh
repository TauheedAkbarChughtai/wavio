sed -i 's/{t("app.editPlaylist.publicLabel")}/Shared with friend/g' apps/mobile/app/\(app\)/\(tabs\)/\(library\)/playlists/\[id\]/edit.tsx
sed -i 's/{t("app.editPlaylist.publicDescription")}/Make this playlist visible to the other user./g' apps/mobile/app/\(app\)/\(tabs\)/\(library\)/playlists/\[id\]/edit.tsx

sed -i 's/{t("app.editPlaylist.publicLabel")}/Shared with friend/g' apps/mobile/app/\(app\)/playlists/new-smart.tsx
sed -i 's/{t("app.editPlaylist.publicDescription")}/Make this smart playlist visible to the other user./g' apps/mobile/app/\(app\)/playlists/new-smart.tsx

sed -i 's/{t("app.editPlaylist.publicLabel")}/Shared with friend/g' apps/mobile/app/\(app\)/playlists/\[id\]/edit-rules.tsx
sed -i 's/{t("app.editPlaylist.publicDescription")}/Make this smart playlist visible to the other user./g' apps/mobile/app/\(app\)/playlists/\[id\]/edit-rules.tsx
