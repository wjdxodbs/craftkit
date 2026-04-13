import { PDFDocument } from '@cantoo/pdf-lib'
import { encryptPdf, decryptPdf } from '../lib/encryptPdf'

async function createTestPdfBytes(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create()
  doc.addPage([100, 100])
  const bytes = await doc.save()
  return (bytes.buffer as ArrayBuffer).slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  )
}

describe('encryptPdf', () => {
  it('비밀번호 없이 로드하면 실패한다', async () => {
    const pdfBytes = await createTestPdfBytes()
    const encrypted = await encryptPdf(pdfBytes, 'secret', 'owner')
    await expect(PDFDocument.load(encrypted)).rejects.toThrow()
  })

  it('올바른 유저 비밀번호로 로드 성공한다', async () => {
    const pdfBytes = await createTestPdfBytes()
    const encrypted = await encryptPdf(pdfBytes, 'secret', 'owner')
    const doc = await PDFDocument.load(encrypted, { password: 'secret' })
    expect(doc.getPageCount()).toBe(1)
  })

  it('ownerPassword 생략 시 userPassword와 동일하게 처리된다', async () => {
    const pdfBytes = await createTestPdfBytes()
    const encrypted = await encryptPdf(pdfBytes, 'only')
    const doc = await PDFDocument.load(encrypted, { password: 'only' })
    expect(doc.getPageCount()).toBe(1)
  })
})

describe('decryptPdf', () => {
  it('올바른 비밀번호로 암호 해제 후 비밀번호 없이 로드 성공한다', async () => {
    const pdfBytes = await createTestPdfBytes()
    const encrypted = await encryptPdf(pdfBytes, 'secret', 'owner')
    const decrypted = await decryptPdf(
      (encrypted.buffer as ArrayBuffer).slice(
        encrypted.byteOffset,
        encrypted.byteOffset + encrypted.byteLength
      ),
      'secret'
    )
    const doc = await PDFDocument.load(decrypted)
    expect(doc.getPageCount()).toBe(1)
  })

  it('잘못된 비밀번호로 해제 시 에러를 던진다', async () => {
    const pdfBytes = await createTestPdfBytes()
    const encrypted = await encryptPdf(pdfBytes, 'secret', 'owner')
    await expect(
      decryptPdf(
        (encrypted.buffer as ArrayBuffer).slice(
          encrypted.byteOffset,
          encrypted.byteOffset + encrypted.byteLength
        ),
        'wrong'
      )
    ).rejects.toThrow()
  })
})
