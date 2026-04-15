import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0.5, g: 0.5, b: 0.5 };
}

export async function addWatermarkToPdf(
  data: ArrayBuffer,
  options: WatermarkOptions,
): Promise<Uint8Array> {
  const { text, fontSize, opacity, color, mode, position, spacing } = options;
  const { r, g, b } = hexToRgb(color);

  const pdfDoc = await PDFDocument.load(data.slice(0));
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    if (mode === "tile") {
      const step = Math.max(textWidth * 0.7 + 50, 100) * spacing;
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
          y = height / 2;
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
          y = height / 2;
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
