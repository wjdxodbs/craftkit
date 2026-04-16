import { useDebouncedBlobUrl } from "@/shared/lib/useDebouncedBlobUrl";
import { resizeImage } from "@/features/image-resize/lib/resizeImage";
import type { OutputFormat } from "@/features/image-resize/lib/resizeImage";

interface UseResizePreviewProps {
  imageEl: HTMLImageElement | null;
  width: number;
  height: number;
  outputFormat: OutputFormat;
  quality: number;
}

export function useResizePreview({
  imageEl,
  width,
  height,
  outputFormat,
  quality,
}: UseResizePreviewProps): {
  previewUrl: string | null;
  previewSize: number | null;
} {
  const { url: previewUrl, size: previewSize } = useDebouncedBlobUrl(
    async () => {
      if (!imageEl || !width || !height) return null;
      return resizeImage(imageEl, width, height, outputFormat, quality / 100);
    },
  );
  return { previewUrl, previewSize };
}
