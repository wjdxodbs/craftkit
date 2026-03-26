import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FaviconGenerator } from '../ui/FaviconGenerator'

vi.mock('@/features/favicon-export/lib/generateFavicons', () => ({
  generateFavicons: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
}))

vi.mock('@/shared/lib/zip', () => ({
  downloadBlob: vi.fn(),
  createZip: vi.fn(),
}))

describe('FaviconGenerator', () => {
  it('업로드 섹션을 렌더링한다', () => {
    render(<FaviconGenerator />)
    expect(screen.getByText(/이미지 업로드/)).toBeInTheDocument()
  })

  it('생성될 파일 목록을 렌더링한다', () => {
    render(<FaviconGenerator />)
    expect(screen.getByText('favicon.ico')).toBeInTheDocument()
    expect(screen.getByText('apple-touch-icon.png')).toBeInTheDocument()
    expect(screen.getByText('manifest.json')).toBeInTheDocument()
  })

  it('업로드 전 Download 버튼이 비활성화된다', () => {
    render(<FaviconGenerator />)
    expect(screen.getByRole('button', { name: /Download ZIP/ })).toBeDisabled()
  })

  it('HTML 스니펫을 렌더링한다', () => {
    render(<FaviconGenerator />)
    expect(screen.getByText(/rel="icon"/)).toBeInTheDocument()
  })
})
