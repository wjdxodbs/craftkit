import { PDFDocument } from 'pdf-lib'

async function fileToNormalizedPngBytes(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context 초기화 실패')
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('canvas.toBlob 실패'))
      blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf))).catch(reject)
    }, 'image/png')
  })
}

export async function convertImagesToPdf(files: File[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()

  for (const file of files) {
    const pngBytes = await fileToNormalizedPngBytes(file)
    const pngImage = await pdfDoc.embedPng(pngBytes)
    const page = pdfDoc.addPage([pngImage.width, pngImage.height])
    page.drawImage(pngImage, { x: 0, y: 0, width: pngImage.width, height: pngImage.height })
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
}
