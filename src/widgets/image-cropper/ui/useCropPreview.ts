import { useDebouncedBlobUrl } from "@/shared/lib/useDebouncedBlobUrl";
import { cropImage } from "@/features/image-crop/lib/cropImage";
import type {
  CropBox,
  OutputFormat,
} from "@/features/image-crop/lib/cropImage";

export function useCropPreview({
  imageEl,
  cropBox,
  displaySize,
  outputFormat,
  quality,
}: {
  imageEl: HTMLImageElement | null;
  cropBox: CropBox | null;
  displaySize: { w: number; h: number } | null;
  outputFormat: OutputFormat;
  quality: number;
}): {
  previewSize: number | null;
} {
  const { size: previewSize } = useDebouncedBlobUrl(async () => {
    if (!imageEl || !cropBox || !displaySize) return null;
    const scale = imageEl.naturalWidth / displaySize.w;
    return cropImage(imageEl, cropBox, scale, outputFormat, quality / 100);
  });
  return { previewSize };
}
