import React, { createContext, useContext, useState, useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { requestDownload } from '@/services/wavioAgent';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { queryClient } from '@/config/queryClient';
import FadeOutScaleDown from '@/components/FadeOutScaleDown';
import CenteredBottomSheetModal from '@/components/CenteredBottomSheetModal';

type DownloadContextType = {
  openDownloadModal: (track: any) => void;
};

const DownloadContext = createContext<DownloadContextType | null>(null);

export const useDownloadModal = () => {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error("useDownloadModal must be used within DownloadModalProvider");
  return ctx;
};

export function DownloadModalProvider({ children }: { children: React.ReactNode }) {
  const modalRef = useRef<BottomSheetModal>(null);
  const [activeTrack, setActiveTrack] = useState<any>(null);
  const toast = useToast();

  const openDownloadModal = (track: any) => {
    setActiveTrack(track);
    modalRef.current?.present();
  };

  const handleDownload = async (format: 'MP3' | 'FLAC') => {
    if (!activeTrack) return;

    modalRef.current?.dismiss();

    const response = await requestDownload(activeTrack.artist, activeTrack.title, format);

    let action: "success" | "warning" | "info" | "error" = "info";
    let title = "Download Info";
    let message = "";

    if (response.status === 'success') {
      action = "success";
      title = "Success";
      message = "Download started! Song will appear shortly.";
      queryClient.invalidateQueries(); // Invalidate Navidrome library cache
    } else if (response.status === 'in_progress') {
      action = "warning";
      title = "In Progress";
      message = "Song is already downloading.";
    } else if (response.status === 'exists') {
      action = "info";
      title = "Exists";
      message = "Song is already in your library!";
    } else {
      action = "error";
      title = "Error";
      message = "Failed to start download.";
    }

    toast.show({
      placement: "top",
      duration: 3000,
      render: () => (
        <Toast action={action}>
          <ToastTitle>{title}</ToastTitle>
          <ToastDescription>{message}</ToastDescription>
        </Toast>
      ),
    });
  };

  return (
    <DownloadContext.Provider value={{ openDownloadModal }}>
      {children}
      <CenteredBottomSheetModal ref={modalRef} snapPoints={["35%"]}>
        {activeTrack && (
          <VStack className="p-6 items-center flex-1">
            <Heading size="xl" className="text-white mb-2 text-center" numberOfLines={2}>
              {activeTrack.title}
            </Heading>
            <Text className="text-gray-400 mb-8">{activeTrack.artist}</Text>

            <HStack className="gap-x-4 w-full">
              <FadeOutScaleDown
                className="flex-1 bg-emerald-600 rounded-full py-4 items-center"
                onPress={() => handleDownload('FLAC')}
              >
                <Text className="text-white font-bold">Download FLAC</Text>
              </FadeOutScaleDown>

              <FadeOutScaleDown
                className="flex-1 border-2 border-gray-500 rounded-full py-4 items-center"
                onPress={() => handleDownload('MP3')}
              >
                <Text className="text-white font-bold">Download MP3</Text>
              </FadeOutScaleDown>
            </HStack>
          </VStack>
        )}
      </CenteredBottomSheetModal>
    </DownloadContext.Provider>
  );
}
