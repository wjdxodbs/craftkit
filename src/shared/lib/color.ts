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
