export type { FontFamily, OgImageConfig } from './renderOgImageToCanvas'
import { renderOgImageToCanvas, type OgImageConfig } from './renderOgImageToCanvas'

export async function generateOgImage(config: OgImageConfig): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  await renderOgImageToCanvas(canvas, config)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('canvas.toBlob 실패'))
        resolve(blob)
      },
      'image/png'
    )
  })
}
