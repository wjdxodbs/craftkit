import { useState, useEffect, useRef } from "react";
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
  previewUrl: string | null;
  previewSize: number | null;
} {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!imageEl || !cropBox || !displaySize) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const scale = imageEl.naturalWidth / displaySize.w;
        const blob = await cropImage(
          imageEl,
          cropBox,
          scale,
          outputFormat,
          quality / 100,
        );
        const url = URL.createObjectURL(blob);
        latestUrlRef.current = url;
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setPreviewSize(blob.size);
      } catch {
        setPreviewUrl(null);
        setPreviewSize(null);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [imageEl, cropBox, outputFormat, quality, displaySize]);

  useEffect(() => {
    return () => {
      if (latestUrlRef.current) URL.revokeObjectURL(latestUrlRef.current);
    };
  }, []);

  return { previewUrl, previewSize };
}
