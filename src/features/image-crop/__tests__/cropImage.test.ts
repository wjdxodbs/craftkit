import { cropImage } from '../lib/cropImage'
import type { CropBox } from '../lib/cropImage'

const mockDrawImage = jest.fn()
const mockToBlob = jest.fn()

beforeEach(() => {
  mockDrawImage.mockClear()
  mockToBlob.mockClear()
  mockToBlob.mockImplementation((cb: BlobCallback, type?: string) => {
    cb(new Blob([''], { type: type ?? 'image/png' }))
  })
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: jest.fn(() => ({ drawImage: mockDrawImage })),
    configurable: true,
  })
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: mockToBlob,
    configurable: true,
    writable: true,
  })
})

describe('cropImage', () => {
  const img = { naturalWidth: 400, naturalHeight: 300 } as HTMLImageElement
  const box: CropBox = { x: 10, y: 20, w: 100, h: 80 }

  it('scale=1 일 때 cropBox 좌표 그대로 drawImage를 호출한다', async () => {
    await cropImage(img, box, 1, 'image/png', 1)
    expect(mockDrawImage).toHaveBeenCalledWith(img, 10, 20, 100, 80, 0, 0, 100, 80)
  })

  it('scale=2 일 때 좌표에 scale을 곱해 drawImage를 호출한다', async () => {
    await cropImage(img, box, 2, 'image/png', 1)
    expect(mockDrawImage).toHaveBeenCalledWith(img, 20, 40, 200, 160, 0, 0, 200, 160)
  })

  it('Blob을 반환한다', async () => {
    const result = await cropImage(img, box, 1, 'image/png', 1)
    expect(result).toBeInstanceOf(Blob)
  })

  it('지정한 포맷과 품질로 toBlob을 호출한다', async () => {
    await cropImage(img, box, 1, 'image/webp', 0.8)
    expect(mockToBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.8)
  })
})
