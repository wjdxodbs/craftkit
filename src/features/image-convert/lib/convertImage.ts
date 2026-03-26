import { createResizedCanvas } from '@/shared/lib/canvas'

export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export async function convertImage(
  source: HTMLImageElement,
  outputFormat: OutputFormat,
  quality: number
): Promise<Blob> {
  const w = source.naturalWidth || 1
  const h = source.naturalHeight || 1
  const canvas = createResizedCanvas(source, w, h)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('canvas.toBlob 실패'))
        resolve(blob)
      },
      outputFormat,
      quality
    )
  })
}
