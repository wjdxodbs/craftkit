import { render, screen } from '@testing-library/react'
import { ImageCropper } from '../ui/ImageCropper'

jest.mock('@/features/image-crop/lib/cropImage', () => ({
  cropImage: jest.fn().mockResolvedValue(new Blob([''], { type: 'image/png' })),
}))

describe('ImageCropper', () => {
  it('이미지 업로드 영역을 렌더링한다', () => {
    render(<ImageCropper />)
    expect(screen.getByText(/이미지 업로드/)).toBeInTheDocument()
  })

  it('비율 프리셋 버튼을 렌더링한다', () => {
    render(<ImageCropper />)
    expect(screen.getByRole('button', { name: 'Free' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1:1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '16:9' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4:3' })).toBeInTheDocument()
  })

  it('포맷 버튼을 렌더링한다', () => {
    render(<ImageCropper />)
    expect(screen.getByRole('button', { name: 'PNG' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'JPG' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'WebP' })).toBeInTheDocument()
  })

  it('업로드 전 Download 버튼이 비활성화된다', () => {
    render(<ImageCropper />)
    expect(screen.getByRole('button', { name: /Download/ })).toBeDisabled()
  })

  it('업로드 전 비율 버튼이 비활성화된다', () => {
    render(<ImageCropper />)
    expect(screen.getByRole('button', { name: '1:1' })).toBeDisabled()
  })
})
