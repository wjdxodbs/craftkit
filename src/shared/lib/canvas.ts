export function createResizedCanvas(
  source: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context를 가져올 수 없습니다");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);
  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg" | "image/webp" = "image/png",
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const callback: BlobCallback = (blob) => {
      if (!blob) return reject(new Error("canvas.toBlob 실패"));
      resolve(blob);
    };
    if (quality === undefined) {
      canvas.toBlob(callback, type);
    } else {
      canvas.toBlob(callback, type, quality);
    }
  });
}

export async function canvasToUint8Array(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg" = "image/png",
): Promise<Uint8Array> {
  const blob = await canvasToBlob(canvas, type);
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
}
