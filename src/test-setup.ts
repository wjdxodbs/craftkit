import '@testing-library/jest-dom'
import { vi } from 'vitest'

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    fillStyle: '',
    font: '',
    textAlign: 'left' as CanvasTextAlign,
  })),
  writable: true,
})

Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: vi.fn(function (this: HTMLCanvasElement, callback: (blob: Blob | null) => void) {
    // PNG signature(8) + IHDR chunk header(8) + IHDR data(13) = 29 bytes
    const buf = new Uint8Array(29)
    const view = new DataView(buf.buffer)
    // PNG signature
    buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4e; buf[3] = 0x47
    buf[4] = 0x0d; buf[5] = 0x0a; buf[6] = 0x1a; buf[7] = 0x0a
    // IHDR length = 13
    view.setUint32(8, 13)
    // IHDR type "IHDR"
    buf[12] = 0x49; buf[13] = 0x48; buf[14] = 0x44; buf[15] = 0x52
    // width and height (use canvas dimensions if available, else 1)
    const w = this.width || 1
    const h = this.height || 1
    view.setUint32(16, w)
    view.setUint32(20, h)
    callback(new Blob([buf], { type: 'image/png' }))
  }),
  writable: true,
})
