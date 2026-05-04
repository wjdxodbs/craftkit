import { createResizedCanvas, canvasToUint8Array } from "@/shared/lib/canvas";
import { encodeIco } from "@/shared/lib/ico";
import { createZip } from "@/shared/lib/zip";
import { FAVICON_SIZES, ICO_SIZES } from "@/shared/config/favicon-sizes";

export async function generateFavicons(
  source: HTMLImageElement | ImageBitmap,
): Promise<Uint8Array> {
  const files: Record<string, Uint8Array | string> = {};

  // PNG 파일 생성
  for (const { filename, size } of FAVICON_SIZES) {
    const canvas = createResizedCanvas(source, size, size);
    files[filename] = await canvasToUint8Array(canvas);
  }

  // ICO 파일 생성 (16, 32, 48px PNG 묶음)
  const icoPngs = await Promise.all(
    ICO_SIZES.map(async (size) => {
      const canvas = createResizedCanvas(source, size, size);
      return canvasToUint8Array(canvas);
    }),
  );
  files["favicon.ico"] = encodeIco(icoPngs);

  return createZip(files);
}
