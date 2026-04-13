import { convertImagesToPdf } from '../lib/convertImagesToPdf'

const mockDrawImage = jest.fn()
const mockAddPage = jest.fn().mockReturnValue({ drawImage: mockDrawImage })
const mockEmbedPng = jest.fn().mockResolvedValue({ width: 200, height: 300 })
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46]))

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn(),
  },
}))

import { PDFDocument } from 'pdf-lib'

const mockBitmapClose = jest.fn()
global.createImageBitmap = jest.fn().mockResolvedValue({
  width: 200,
  height: 300,
  close: mockBitmapClose,
})

describe('convertImagesToPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAddPage.mockReturnValue({ drawImage: mockDrawImage })
    mockEmbedPng.mockResolvedValue({ width: 200, height: 300 })
    mockSave.mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46]))
    ;(PDFDocument.create as jest.Mock).mockResolvedValue({
      addPage: mockAddPage,
      embedPng: mockEmbedPng,
      save: mockSave,
    })
  })

  it('File 배열로부터 PDF Blob을 생성한다', async () => {
    const file = new File(['data'], 'test.png', { type: 'image/png' })
    const result = await convertImagesToPdf([file])
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('application/pdf')
  })

  it('각 파일마다 PDF 페이지를 추가한다', async () => {
    const files = [
      new File(['a'], 'a.png', { type: 'image/png' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ]
    await convertImagesToPdf(files)
    expect(mockAddPage).toHaveBeenCalledTimes(2)
    expect(mockEmbedPng).toHaveBeenCalledTimes(2)
    expect(mockDrawImage).toHaveBeenCalledTimes(2)
  })

  it('페이지 크기를 이미지 크기에 맞춰 설정한다', async () => {
    const file = new File(['data'], 'test.png', { type: 'image/png' })
    await convertImagesToPdf([file])
    expect(mockAddPage).toHaveBeenCalledWith([200, 300])
    expect(mockDrawImage).toHaveBeenCalledWith(
      expect.objectContaining({ width: 200, height: 300 }),
      expect.objectContaining({ x: 0, y: 0, width: 200, height: 300 })
    )
  })

  it('빈 배열이면 빈 PDF를 반환한다', async () => {
    const result = await convertImagesToPdf([])
    expect(result).toBeInstanceOf(Blob)
    expect(mockAddPage).not.toHaveBeenCalled()
  })

  it('toBlob이 null을 반환하면 reject한다', async () => {
    ;(HTMLCanvasElement.prototype.toBlob as jest.Mock).mockImplementationOnce(
      (callback: BlobCallback) => callback(null)
    )
    const file = new File(['data'], 'test.png', { type: 'image/png' })
    await expect(convertImagesToPdf([file])).rejects.toThrow('canvas.toBlob 실패')
  })
})
