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
  value: vi.fn((callback: (blob: Blob | null) => void) => {
    callback(new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' }))
  }),
  writable: true,
})
