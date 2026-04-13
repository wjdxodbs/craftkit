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

  it('업로드 전 비율·포맷 버튼이 표시되지 않는다', () => {
    render(<ImageCropper />)
    expect(screen.queryByRole('button', { name: 'Free' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'PNG' })).not.toBeInTheDocument()
  })

  it('업로드 전 Download 버튼이 비활성화된다', () => {
    render(<ImageCropper />)
    expect(screen.getByRole('button', { name: /Download/ })).toBeDisabled()
  })
})
