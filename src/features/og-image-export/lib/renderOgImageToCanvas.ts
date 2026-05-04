export type FontFamily = "Inter" | "Serif" | "Mono";

export type TemplateName = "classic" | "gradient";

export interface OgImageConfig {
  backgroundColor: string;
  title: string;
  subtitle: string;
  logoDataUrl?: string;
  fontFamily: FontFamily;
  template?: TemplateName;

  // gradient 템플릿 전용
  gradientColor2?: string;
  gradientAngle?: number;
}

export const FONT_MAP: Record<FontFamily, string> = {
  Inter: '"Inter", sans-serif',
  Serif: "Georgia, serif",
  Mono: '"Courier New", monospace',
};

export const W = 1200;
export const H = 630;

import { isLightColor } from "@/shared/lib/color";

/**
 * 로고 이미지를 contain-fit 방식으로 지정 영역에 그린다.
 * 비율을 유지하면서 박스 안에 맞추고, 박스 중앙에 배치한다.
 */
export async function loadLogo(
  ctx: CanvasRenderingContext2D,
  dataUrl: string,
  x: number,
  y: number,
  w: number,
  h: number,
): Promise<void> {
  await new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(w / img.width, h / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = x + (w - drawW) / 2;
      const drawY = y + (h - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = dataUrl;
  });
}

/**
 * 텍스트가 maxWidth를 넘으면 폰트 크기를 자동으로 줄여서 그린다.
 */
export function drawAutoSizedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  initialSize: number,
  minSize: number,
  weight: string,
  fontFamily: string,
  color: string,
): number {
  let size = initialSize;
  ctx.font = `${weight} ${size}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${fontFamily}`;
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y, maxWidth);
  return size;
}

export async function renderClassicTemplate(
  canvas: HTMLCanvasElement,
  config: OgImageConfig,
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 배경
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, W, H);

  // 로고
  if (config.logoDataUrl) {
    await loadLogo(ctx, config.logoDataUrl, 80, H / 2 - 160, 80, 80);
  }

  const fontFamily = FONT_MAP[config.fontFamily];
  const light = isLightColor(config.backgroundColor);
  const maxTextWidth = W - 160;

  // 제목 — maxTextWidth에 맞게 폰트 크기 자동 축소
  const titleSize = drawAutoSizedText(
    ctx,
    config.title,
    80,
    H / 2 + 20,
    maxTextWidth,
    64,
    40,
    "bold",
    fontFamily,
    light ? "#111111" : "#f1f5f9",
  );

  // 부제목 — maxTextWidth에 맞게 폰트 크기 자동 축소
  drawAutoSizedText(
    ctx,
    config.subtitle,
    80,
    H / 2 + 20 + titleSize + 20,
    maxTextWidth,
    32,
    24,
    "normal",
    fontFamily,
    light ? "#555555" : "#94a3b8",
  );
}

export async function renderOgImageToCanvas(
  canvas: HTMLCanvasElement,
  config: OgImageConfig,
): Promise<void> {
  const template = config.template ?? "classic";

  switch (template) {
    case "gradient": {
      const { renderGradientTemplate } =
        await import("./renderGradientTemplate");
      await renderGradientTemplate(canvas, config);
      break;
    }
    case "classic":
    default:
      await renderClassicTemplate(canvas, config);
      break;
  }
}
