import { canvasToBlob } from "@/shared/lib/canvas";

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return canvasToBlob(canvas, "image/png");
}
