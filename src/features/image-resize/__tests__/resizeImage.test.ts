import { resizeImage } from '../lib/resizeImage'
import { createResizedCanvas } from '@/shared/lib/canvas'

jest.mock('@/shared/lib/canvas', () => ({
  createResizedCanvas: jest.fn((source: HTMLImageElement, w: number, h: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    return canvas
  }),
}))

HTMLCanvasElement.prototype.toBlob = jest.fn(function (
  callback: BlobCallback,
  type?: string
) {
  callback(new Blob(['test'], { type: type ?? 'image/png' }))
})

describe('resizeImage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('지정한 크기로 canvas를 생성한다', async () => {
    const img = document.createElement('img')
    await resizeImage(img, 800, 600, 'image/png', 1)
    expect(createResizedCanvas).toHaveBeenCalledWith(img, 800, 600)
  })

  it('PNG 포맷으로 변환한다', async () => {
    const img = document.createElement('img')
    const result = await resizeImage(img, 800, 600, 'image/png', 1)
    expect(result).toBeInstanceOf(Blob)
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/png',
      1
    )
  })

  it('JPG 포맷과 품질값으로 변환한다', async () => {
    const img = document.createElement('img')
    const result = await resizeImage(img, 400, 300, 'image/jpeg', 0.8)
    expect(result).toBeInstanceOf(Blob)
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.8
    )
  })

  it('WebP 포맷과 품질값으로 변환한다', async () => {
    const img = document.createElement('img')
    const result = await resizeImage(img, 1920, 1080, 'image/webp', 0.9)
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
    await expect(resizeImage(img, 800, 600, 'image/png', 1)).rejects.toThrow(
      'canvas.toBlob 실패'
    )
  })
})
