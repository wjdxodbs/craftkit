import { canvasToBlob } from "@/shared/lib/canvas";
import type { OutputFormat } from "@/shared/config/image-formats";

export type { OutputFormat };

export interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export async function cropImage(
  img: HTMLImageElement,
  box: CropBox,
  scale: number,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  const sx = Math.round(box.x * scale);
  const sy = Math.round(box.y * scale);
  const sw = Math.round(box.w * scale);
  const sh = Math.round(box.h * scale);
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas context 생성 실패");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvasToBlob(canvas, format, quality);
}
