import { useState, useEffect, useRef } from "react";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!imageEl || !width || !height) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const blob = await resizeImage(
          imageEl,
          width,
          height,
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
  }, [imageEl, width, height, outputFormat, quality]);

  useEffect(() => {
    return () => {
      if (latestUrlRef.current) URL.revokeObjectURL(latestUrlRef.current);
    };
  }, []);

  return { previewUrl, previewSize };
}
