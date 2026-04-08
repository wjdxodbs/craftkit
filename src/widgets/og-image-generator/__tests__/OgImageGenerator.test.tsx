import { render, screen, fireEvent } from '@testing-library/react'
import { OgImageGenerator } from '../ui/OgImageGenerator'

jest.mock('@/features/og-image-export/lib/generateOgImage', () => ({
  generateOgImage: jest.fn().mockResolvedValue(new Blob(['mock'], { type: 'image/png' })),
}))

jest.mock('@/features/og-image-export/lib/renderOgImageToCanvas', () => ({
  renderOgImageToCanvas: jest.fn().mockResolvedValue(undefined),
}))

describe('OgImageGenerator', () => {
  it('템플릿 탭(Classic, Gradient, Code)을 렌더링한다', () => {
    render(<OgImageGenerator />)
    expect(screen.getByRole('button', { name: 'Classic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gradient' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Code' })).toBeInTheDocument()
  })

  it('배경색 섹션을 렌더링한다 (기본 classic)', () => {
    render(<OgImageGenerator />)
    expect(screen.getByText('배경색')).toBeInTheDocument()
  })

  it('제목 입력 필드를 렌더링한다', () => {
    render(<OgImageGenerator />)
    expect(screen.getByPlaceholderText(/제목을 입력해주세요/)).toBeInTheDocument()
  })

  it('부제목 입력 필드를 렌더링한다', () => {
    render(<OgImageGenerator />)
    expect(screen.getByPlaceholderText(/부제목 입력/)).toBeInTheDocument()
  })

  it('폰트 선택 버튼을 렌더링한다 (classic)', () => {
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
    const input = screen.getByPlaceholderText(/제목을 입력해주세요/) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'New Title' } })
    expect(input.value).toBe('New Title')
  })

  it('Gradient 탭 클릭 시 그라데이션 프리셋 섹션이 나타난다', () => {
    render(<OgImageGenerator />)
    fireEvent.click(screen.getByRole('button', { name: 'Gradient' }))
    expect(screen.getByText('그라데이션 프리셋')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sunset/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ocean/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cyberpunk/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Forest/ })).toBeInTheDocument()
  })

  it('Code 탭 클릭 시 파일 경로 입력 필드가 나타난다', () => {
    render(<OgImageGenerator />)
    fireEvent.click(screen.getByRole('button', { name: 'Code' }))
    expect(screen.getByPlaceholderText('src/components/App.tsx')).toBeInTheDocument()
  })

  it('Code 탭 클릭 시 폰트 버튼(Inter)이 사라진다', () => {
    render(<OgImageGenerator />)
    fireEvent.click(screen.getByRole('button', { name: 'Code' }))
    expect(screen.queryByRole('button', { name: 'Inter' })).not.toBeInTheDocument()
  })
})
