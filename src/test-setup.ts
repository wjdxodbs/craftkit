import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

// Polyfill Blob.arrayBuffer for jest-environment-jsdom
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this)
    })
  }
}

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    drawImage: jest.fn(),
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 100 })),
    fillStyle: '',
    font: '',
    textAlign: 'left' as CanvasTextAlign,
  })),
  writable: true,
})

// Mock Image so that setting src triggers onload immediately
class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  width = 0
  height = 0
  private _src = ''
  get src() { return this._src }
  set src(value: string) {
    this._src = value
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
}
globalThis.Image = MockImage as unknown as typeof Image

Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: jest.fn(function (this: HTMLCanvasElement, callback: (blob: Blob | null) => void) {
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
