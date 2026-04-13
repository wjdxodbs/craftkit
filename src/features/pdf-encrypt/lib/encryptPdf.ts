import { PDFDocument } from '@cantoo/pdf-lib'

export async function encryptPdf(
  data: ArrayBuffer,
  userPassword: string,
  ownerPassword?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(data.slice(0))
  pdfDoc.encrypt({
    userPassword,
    ownerPassword: ownerPassword ?? userPassword,
  })
  return pdfDoc.save()
}

export async function decryptPdf(
  data: ArrayBuffer,
  password: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(data.slice(0), { password })
  return pdfDoc.save()
}

export async function isPdfEncrypted(data: ArrayBuffer): Promise<boolean> {
  try {
    await PDFDocument.load(data.slice(0))
    return false
  } catch {
    return true
  }
}
