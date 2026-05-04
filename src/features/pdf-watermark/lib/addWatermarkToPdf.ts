import { PDFDocument, rgb, degrees, type PDFImage } from "pdf-lib";
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

export type WatermarkPosition =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface TextWatermarkOptions {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  mode: "tile" | "single";
  position: WatermarkPosition;
  spacing: number;
}

/**
 * 이미지 워터마크는 단일 위치 배치만 지원한다 — 대각 반복 패턴은
 * 시각적으로 노이즈가 많고 실제 use case가 거의 없어 의도적으로 제외.
 */
export interface ImageWatermarkOptions {
  type: "image";
  imageBytes: ArrayBuffer;
  imageMimeType: "image/png" | "image/jpeg";
  /** PDF 포인트 단위 너비. 높이는 원본 비율로 자동 계산 */
  imageWidth: number;
  opacity: number;
  position: WatermarkPosition;
}

export type WatermarkOptions = TextWatermarkOptions | ImageWatermarkOptions;

export async function addWatermarkToPdf(
  data: ArrayBuffer,
  options: WatermarkOptions,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(data);
  if (options.type === "image") {
    await applyImageWatermark(pdfDoc, options);
  } else {
    await applyTextWatermark(pdfDoc, options);
  }
  return pdfDoc.save();
}

async function applyTextWatermark(
  pdfDoc: PDFDocument,
  options: TextWatermarkOptions,
): Promise<void> {
  const { text, fontSize, opacity, color, mode, position, spacing } = options;
  const [r255, g255, b255] = hexToRgb(color);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

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
      const { x, y } = singlePosition(
        position,
        width,
        height,
        textWidth,
        textHeight,
      );
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
}

async function applyImageWatermark(
  pdfDoc: PDFDocument,
  options: ImageWatermarkOptions,
): Promise<void> {
  const { imageBytes, imageMimeType, imageWidth, opacity, position } = options;

  const image: PDFImage =
    imageMimeType === "image/png"
      ? await pdfDoc.embedPng(imageBytes)
      : await pdfDoc.embedJpg(imageBytes);

  const aspect = image.height / image.width;
  const imgW = imageWidth;
  const imgH = imageWidth * aspect;

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();
    const { x, y } = singlePosition(position, width, height, imgW, imgH);
    page.drawImage(image, {
      x,
      y,
      width: imgW,
      height: imgH,
      opacity,
    });
  }
}

function singlePosition(
  position: WatermarkPosition,
  pageW: number,
  pageH: number,
  elemW: number,
  elemH: number,
): { x: number; y: number } {
  const margin = 24;
  switch (position) {
    case "top-left":
      return { x: margin, y: pageH - margin - elemH };
    case "top-right":
      return { x: pageW - margin - elemW, y: pageH - margin - elemH };
    case "bottom-left":
      return { x: margin, y: margin };
    case "bottom-right":
      return { x: pageW - margin - elemW, y: margin };
    case "center":
    default:
      return { x: pageW / 2 - elemW / 2, y: pageH / 2 - elemH / 2 };
  }
}
