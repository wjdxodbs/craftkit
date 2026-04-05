export function createResizedCanvas(
  source: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height)
  return canvas
}

export function canvasToUint8Array(
  canvas: HTMLCanvasElement,
  type: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('canvas.toBlob 실패'))
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)))
      },
      type
    )
  })
}
