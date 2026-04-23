export type { FontFamily, OgImageConfig } from "./renderOgImageToCanvas";
import {
  renderOgImageToCanvas,
  type OgImageConfig,
} from "./renderOgImageToCanvas";
import { canvasToBlob } from "@/shared/lib/canvas";

export async function generateOgImage(config: OgImageConfig): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  await renderOgImageToCanvas(canvas, config);
  return canvasToBlob(canvas, "image/png");
}
