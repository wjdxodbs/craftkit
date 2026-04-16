import { PDFDocument, rgb, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { hexToRgb } from "@/shared/lib/color";

let _fontBytesCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (_fontBytesCache) return _fontBytesCache;
  const res = await fetch("/fonts/NanumGothic.ttf");
  if (!res.ok) throw new Error("폰트 로드 실패");
  _fontBytesCache = await res.arrayBuffer();
  return _fontBytesCache;
}

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  mode: "tile" | "single";
  position:
    | "center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  spacing: number;
}

export async function addWatermarkToPdf(
  data: ArrayBuffer,
  options: WatermarkOptions,
): Promise<Uint8Array> {
  const { text, fontSize, opacity, color, mode, position, spacing } = options;
  const [r255, g255, b255] = hexToRgb(color);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

  const pdfDoc = await PDFDocument.load(data);
  pdfDoc.registerFontkit(fontkit);
  const fontBytes = await loadFont();
  const font = await pdfDoc.embedFont(fontBytes);

  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const textHeight = font.heightAtSize(fontSize);

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();

    if (mode === "tile") {
      const step = Math.max(Math.max(textWidth * 0.7 + 50, 100) * spacing, 30);
      for (let x = -width; x < width * 2; x += step) {
        for (let y = -height; y < height * 2; y += step) {
          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(45),
          });
        }
      }
    } else {
      const margin = 24;
      let x: number;
      let y: number;

      switch (position) {
        case "center":
          x = width / 2 - textWidth / 2;
          y = height / 2 - textHeight / 2;
          break;
        case "top-left":
          x = margin;
          y = height - margin - textHeight;
          break;
        case "top-right":
          x = width - margin - textWidth;
          y = height - margin - textHeight;
          break;
        case "bottom-left":
          x = margin;
          y = margin;
          break;
        case "bottom-right":
          x = width - margin - textWidth;
          y = margin;
          break;
        default:
          x = width / 2 - textWidth / 2;
          y = height / 2 - textHeight / 2;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
      });
    }
  }

  return pdfDoc.save();
}
