import { convertImage } from '../lib/convertImage'
import type { OutputFormat } from '../lib/convertImage'

HTMLCanvasElement.prototype.toBlob = jest.fn(function (
  callback: BlobCallback,
  type?: string
) {
  callback(new Blob(['test'], { type: type ?? 'image/png' }))
})

describe('convertImage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('PNG 포맷으로 변환한다', async () => {
    const img = document.createElement('img')
    const result = await convertImage(img, 'image/png', 1)
    expect(result).toBeInstanceOf(Blob)
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/png',
      1
    )
  })

  it('JPG 포맷과 품질값으로 변환한다', async () => {
    const img = document.createElement('img')
    const result = await convertImage(img, 'image/jpeg', 0.8)
    expect(result).toBeInstanceOf(Blob)
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.8
    )
  })

  it('WebP 포맷과 품질값으로 변환한다', async () => {
    const img = document.createElement('img')
    const result = await convertImage(img, 'image/webp', 0.9)
    expect(result).toBeInstanceOf(Blob)
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/webp',
      0.9
    )
  })

  it('toBlob이 null을 반환하면 reject한다', async () => {
    ;(HTMLCanvasElement.prototype.toBlob as jest.Mock).mockImplementationOnce(
      (callback: BlobCallback) => callback(null)
    )
    const img = document.createElement('img')
    await expect(convertImage(img, 'image/png', 1)).rejects.toThrow(
      'canvas.toBlob 실패'
    )
  })
})
