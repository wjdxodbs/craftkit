import { createResizedCanvas } from '@/shared/lib/canvas'

export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export async function resizeImage(
  source: HTMLImageElement,
  width: number,
  height: number,
  outputFormat: OutputFormat,
  quality: number
): Promise<Blob> {
  const canvas = createResizedCanvas(source, width, height)
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
