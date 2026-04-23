import { createResizedCanvas, canvasToBlob } from "@/shared/lib/canvas";
import type { OutputFormat } from "@/shared/config/image-formats";

export type { OutputFormat };

export async function resizeImage(
  source: HTMLImageElement,
  width: number,
  height: number,
  outputFormat: OutputFormat,
  quality: number,
): Promise<Blob> {
  const canvas = createResizedCanvas(source, width, height);
  return canvasToBlob(canvas, outputFormat, quality);
}
