
import { createResizedCanvas, canvasToUint8Array } from '../canvas'

describe('createResizedCanvas', () => {
  it('지정한 width/height로 canvas를 생성한다', () => {
    const mockImg = document.createElement('img')
    const canvas = createResizedCanvas(mockImg, 32, 32)
    expect(canvas.width).toBe(32)
    expect(canvas.height).toBe(32)
  })

  it('다른 사이즈도 올바르게 생성한다', () => {
    const mockImg = document.createElement('img')
    const canvas = createResizedCanvas(mockImg, 180, 180)
    expect(canvas.width).toBe(180)
    expect(canvas.height).toBe(180)
  })
})

describe('canvasToUint8Array', () => {
  it('Uint8Array를 반환한다', async () => {
    const canvas = document.createElement('canvas')
    const result = await canvasToUint8Array(canvas)
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(0)
  })
})
