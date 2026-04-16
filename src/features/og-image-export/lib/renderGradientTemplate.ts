import {
  type OgImageConfig,
  FONT_MAP,
  W,
  H,
  isLightColor,
  loadLogo,
  drawAutoSizedText,
} from "./renderOgImageToCanvas";

const GRADIENT_PRESETS: Record<string, [string, string]> = {
  sunset: ["#f97316", "#ec4899"],
  ocean: ["#06b6d4", "#6366f1"],
  cyberpunk: ["#a855f7", "#ec4899"],
  forest: ["#10b981", "#06b6d4"],
};

/**
 * 16진수 색상을 각 채널의 숫자 값으로 분해한다.
 */
function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

/**
 * 숫자 채널 값을 16진수 색상 문자열로 변환한다.
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.min(255, Math.max(0, Math.round(v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/**
 * 색상을 약 80 단위 밝게 만들어 그라디언트 두 번째 색으로 사용한다.
 * backgroundColor가 어두운 경우 밝아지고, 밝은 경우는 약간 다른 톤이 나온다.
 */
function lightenColor(hex: string, amount = 80): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

/**
 * 두 색상 중 더 밝은 색을 기준으로 텍스트 색상을 결정한다.
 * 두 색 모두 밝으면 어두운 텍스트, 아니면 밝은 텍스트를 사용한다.
 */
function resolveTextColor(color1: string, color2: string): string {
  const bothLight = isLightColor(color1) && isLightColor(color2);
  return bothLight ? "#1e293b" : "#f1f5f9";
}

/**
 * 각도(도)와 캔버스 크기를 이용해 createLinearGradient의 좌표를 계산한다.
 */
function angleToGradientCoords(
  angle: number,
  w: number,
  h: number,
): [number, number, number, number] {
  const rad = ((angle - 90) * Math.PI) / 180;
  const halfW = w / 2;
  const halfH = h / 2;
  // 각도 방향으로 캔버스 대각선 길이 만큼 이동
  const len = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
  const halfLen = len / 2;
  const x0 = halfW - Math.sin(rad) * halfLen;
  const y0 = halfH - Math.cos(rad) * halfLen;
  const x1 = halfW + Math.sin(rad) * halfLen;
  const y1 = halfH + Math.cos(rad) * halfLen;
  return [x0, y0, x1, y1];
}

export async function renderGradientTemplate(
  canvas: HTMLCanvasElement,
  config: OgImageConfig,
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 그라디언트 색상 결정: preset > 직접 지정 > 자동 밝기 보정
  let color1 = config.backgroundColor;
  let color2: string;

  if (config.gradientPreset && GRADIENT_PRESETS[config.gradientPreset]) {
    [color1, color2] = GRADIENT_PRESETS[config.gradientPreset];
  } else if (config.gradientColor2) {
    color2 = config.gradientColor2;
  } else {
    color2 = lightenColor(config.backgroundColor);
  }

  // 그라디언트 배경
  const angle = config.gradientAngle ?? 135;
  const [x0, y0, x1, y1] = angleToGradientCoords(angle, W, H);
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 깊이감을 위한 소프트 방사형 오버레이
  const radialGrad = ctx.createRadialGradient(
    W * 0.3,
    H * 0.3,
    0,
    W * 0.5,
    H * 0.5,
    W * 0.7,
  );
  radialGrad.addColorStop(0, "rgba(255,255,255,0.15)");
  radialGrad.addColorStop(1, "rgba(0,0,0,0)");
  const prevComposite = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = radialGrad;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = prevComposite;

  // 텍스트 색상
  const textColor = resolveTextColor(color1, color2);
  const subtitleColor =
    isLightColor(color1) && isLightColor(color2) ? "#475569" : "#cbd5e1";

  // 로고 (텍스트 위, 수평 중앙)
  const fontFamily = FONT_MAP[config.fontFamily];
  const logoH = 80;
  const logoW = 160;
  const logoY = config.logoDataUrl ? H / 2 - 120 : H / 2 - 60;

  if (config.logoDataUrl) {
    await loadLogo(
      ctx,
      config.logoDataUrl,
      W / 2 - logoW / 2,
      logoY,
      logoW,
      logoH,
    );
  }

  // 텍스트 중앙 정렬
  ctx.textAlign = "center";

  const maxTextWidth = W - 160;
  const titleY = config.logoDataUrl ? logoY + logoH + 60 : H / 2 + 20;

  const titleSize = drawAutoSizedText(
    ctx,
    config.title,
    W / 2,
    titleY,
    maxTextWidth,
    64,
    24,
    "bold",
    fontFamily,
    textColor,
  );

  drawAutoSizedText(
    ctx,
    config.subtitle,
    W / 2,
    titleY + titleSize + 24,
    maxTextWidth,
    32,
    16,
    "normal",
    fontFamily,
    subtitleColor,
  );

  ctx.textAlign = "start";
}
