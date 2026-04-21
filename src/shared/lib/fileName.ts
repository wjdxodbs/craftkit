export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>\x00]/g, "_");
}

export function buildOutputName(
  originalName: string | null,
  suffix: string,
  extension: string,
): string {
  const raw = originalName
    ? originalName.replace(
        new RegExp(`\\.${extension}$`, "i"),
        `_${suffix}.${extension}`,
      )
    : `${suffix}.${extension}`;
  return sanitizeFilename(raw);
}
