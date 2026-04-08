import { zipSync } from 'fflate'

const encoder = new TextEncoder()

export function createZip(
  files: Record<string, Uint8Array | string>
): Uint8Array {
  const entries: Record<string, Uint8Array> = {}
  for (const [name, content] of Object.entries(files)) {
    entries[name] = typeof content === 'string' ? new Uint8Array(encoder.encode(content)) : content
  }
  return zipSync(entries)
}

export function downloadBlob(
  filename: string,
  data: Uint8Array,
  mimeType = 'application/zip'
): void {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
