import { render, screen } from '@testing-library/react'
import { FaviconGenerator } from '../ui/FaviconGenerator'

jest.mock('@/features/favicon-export/lib/generateFavicons', () => ({
  generateFavicons: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
}))

jest.mock('@/shared/lib/zip', () => ({
  downloadBlob: jest.fn(),
  createZip: jest.fn(),
}))

describe('FaviconGenerator', () => {
  it('업로드 섹션을 렌더링한다', () => {
    render(<FaviconGenerator />)
    expect(screen.getByText(/클릭하거나 드래그해서/)).toBeInTheDocument()
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

})
