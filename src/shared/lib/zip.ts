import { zipSync } from "fflate";
import { downloadBlob } from "./downloadBlob";

const encoder = new TextEncoder();

export function createZip(
  files: Record<string, Uint8Array | string>,
): Uint8Array {
  const entries: Record<string, Uint8Array> = {};
  for (const [name, content] of Object.entries(files)) {
    entries[name] =
      typeof content === "string"
        ? new Uint8Array(encoder.encode(content))
        : content;
  }
  return zipSync(entries);
}

export function downloadBytes(
  filename: string,
  data: Uint8Array,
  mimeType = "application/zip",
): void {
  const buffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
  downloadBlob(new Blob([buffer], { type: mimeType }), filename);
}
