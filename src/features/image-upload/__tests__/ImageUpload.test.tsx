import { render, screen, fireEvent } from '@testing-library/react'
import { ImageUpload } from '../ui/ImageUpload'

describe('ImageUpload', () => {
  it('업로드 안내 텍스트를 렌더링한다', () => {
    render(<ImageUpload onFileLoad={jest.fn()} />)
    expect(screen.getByText(/클릭하거나 드래그해서/)).toBeInTheDocument()
  })

  it('권장 사이즈 텍스트를 렌더링한다', () => {
    render(<ImageUpload onFileLoad={jest.fn()} />)
    expect(screen.getByText(/512×512/)).toBeInTheDocument()
  })

  it('드래그 오버 시 스타일이 변경된다', () => {
    render(<ImageUpload onFileLoad={jest.fn()} />)
    const dropZone = screen.getByRole('button')
    fireEvent.dragOver(dropZone)
    expect(dropZone.className).toContain('border-[#a78bfa]')
  })

  it('드래그 리브 시 스타일이 원복된다', () => {
    render(<ImageUpload onFileLoad={jest.fn()} />)
    const dropZone = screen.getByRole('button')
    fireEvent.dragOver(dropZone)
    fireEvent.dragLeave(dropZone)
    expect(dropZone.className).not.toContain('border-[#a78bfa]')
  })
})
