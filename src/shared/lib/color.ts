/**
 * hex 색상 문자열을 0–255 범위 RGB 튜플로 변환한다.
 */
export function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace(/^#/, "");
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

/**
 * 0–255 RGB 값을 클램프 후 hex 색상 문자열로 변환한다.
 */
export function rgbToHex(r: number, g: number, b: number): string {
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
 * sRGB 상대 휘도 기준으로 hex 색상이 밝은지 판정한다 (0.5 초과면 밝음).
 */
export function isLightColor(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
