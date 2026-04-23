import { useDebouncedBlobUrl } from "@/shared/lib/useDebouncedBlobUrl";
import { canvasToBlob } from "@/shared/lib/canvas";
import type { OutputFormat } from "@/shared/config/image-formats";

export function useFullImagePreview({
  imageEl,
  outputFormat,
  quality,
}: {
  imageEl: HTMLImageElement | null;
  outputFormat: OutputFormat;
  quality: number;
}): { fullPreviewUrl: string | null } {
  const { url: fullPreviewUrl } = useDebouncedBlobUrl(async () => {
    if (!imageEl) return null;
    if (outputFormat === "image/png") return null;
    const canvas = document.createElement("canvas");
    canvas.width = imageEl.naturalWidth;
    canvas.height = imageEl.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(imageEl, 0, 0);
    return canvasToBlob(canvas, outputFormat, quality / 100);
  });
  return { fullPreviewUrl };
}
