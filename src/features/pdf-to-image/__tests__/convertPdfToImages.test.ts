import { getPdfPageCount, renderPdfPageToDataUrl, convertPdfPageToBlob } from '../lib/convertPdfToImages'

const mockRender = jest.fn().mockReturnValue({ promise: Promise.resolve() })
const mockGetViewport = jest.fn().mockReturnValue({ width: 100, height: 150 })
const mockGetPage = jest.fn().mockResolvedValue({
  getViewport: mockGetViewport,
  render: mockRender,
})
const mockDestroy = jest.fn().mockResolvedValue(undefined)

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: jest.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 3,
      getPage: mockGetPage,
      destroy: mockDestroy,
    }),
  }),
}))

HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,abc')

describe('getPdfPageCount', () => {
  beforeEach(() => jest.clearAllMocks())

  it('PDF의 페이지 수를 반환한다', async () => {
    const data = new ArrayBuffer(8)
    const count = await getPdfPageCount(data)
    expect(count).toBe(3)
  })

  it('완료 후 PDF 문서를 destroy한다', async () => {
    const data = new ArrayBuffer(8)
    await getPdfPageCount(data)
    expect(mockDestroy).toHaveBeenCalled()
  })
})

describe('renderPdfPageToDataUrl', () => {
  beforeEach(() => jest.clearAllMocks())

  it('지정한 페이지를 data URL로 렌더링한다', async () => {
    const data = new ArrayBuffer(8)
    const result = await renderPdfPageToDataUrl(data, 1, 0.3)
    expect(typeof result).toBe('string')
    expect(mockGetPage).toHaveBeenCalledWith(1)
    expect(mockGetViewport).toHaveBeenCalledWith({ scale: 0.3 })
    expect(mockRender).toHaveBeenCalled()
  })
})

describe('convertPdfPageToBlob', () => {
  beforeEach(() => jest.clearAllMocks())

  it('지정한 페이지를 Blob으로 변환한다', async () => {
    const data = new ArrayBuffer(8)
    const result = await convertPdfPageToBlob(data, 2, 'image/jpeg', 0.9)
    expect(result).toBeInstanceOf(Blob)
    expect(mockGetPage).toHaveBeenCalledWith(2)
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.9
    )
  })

  it('toBlob이 null을 반환하면 reject한다', async () => {
    ;(HTMLCanvasElement.prototype.toBlob as jest.Mock).mockImplementationOnce(
      (callback: BlobCallback) => callback(null)
    )
    const data = new ArrayBuffer(8)
    await expect(convertPdfPageToBlob(data, 1, 'image/png', 1)).rejects.toThrow('canvas.toBlob 실패')
  })
})
