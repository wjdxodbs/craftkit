import { render, screen, fireEvent } from '@testing-library/react'
import { OgImageGenerator } from '../ui/OgImageGenerator'

jest.mock('@/features/og-image-export/lib/generateOgImage', () => ({
  generateOgImage: jest.fn().mockResolvedValue(new Blob(['mock'], { type: 'image/png' })),
}))

jest.mock('@/features/og-image-export/lib/renderOgImageToCanvas', () => ({
  renderOgImageToCanvas: jest.fn().mockResolvedValue(undefined),
}))

describe('OgImageGenerator', () => {
  it('배경색 섹션을 렌더링한다', () => {
    render(<OgImageGenerator />)
    expect(screen.getByText('배경색')).toBeInTheDocument()
  })

  it('제목 입력 필드를 렌더링한다', () => {
    render(<OgImageGenerator />)
    expect(screen.getByPlaceholderText(/제목 입력/)).toBeInTheDocument()
  })

  it('부제목 입력 필드를 렌더링한다', () => {
    render(<OgImageGenerator />)
    expect(screen.getByPlaceholderText(/부제목 입력/)).toBeInTheDocument()
  })

  it('폰트 선택 버튼을 렌더링한다', () => {
    render(<OgImageGenerator />)
    expect(screen.getByRole('button', { name: 'Inter' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Serif' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mono' })).toBeInTheDocument()
  })

  it('Download PNG 버튼을 렌더링한다', () => {
    render(<OgImageGenerator />)
    expect(screen.getByRole('button', { name: /Download PNG/ })).toBeInTheDocument()
  })

  it('제목 입력 시 값이 변경된다', () => {
    render(<OgImageGenerator />)
    const input = screen.getByPlaceholderText(/제목 입력/) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'New Title' } })
    expect(input.value).toBe('New Title')
  })
})
