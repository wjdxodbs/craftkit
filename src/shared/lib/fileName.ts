export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>\x00]/g, "_");
}

export function buildOutputName(
  originalName: string | null,
  suffix: string,
  extension: string,
): string {
  if (!originalName) return sanitizeFilename(`${suffix}.${extension}`);
  // 원본 확장자(어떤 종류든)를 제거 후 새 확장자 부여 — 포맷 변환도 지원
  const base = originalName.replace(/\.[^./\\]+$/, "");
  return sanitizeFilename(`${base}_${suffix}.${extension}`);
}
