import { render, screen } from '@testing-library/react'

import { ToolCard } from '../ui/ToolCard'
import type { Tool } from '@/shared/config/tools'

const mockTool: Tool = {
  id: 'favicon',
  name: 'Favicon Generator',
  description: 'favicon.ico 생성',
  href: '/tools/favicon',
  tags: ['.ico', '.png'],
  accentColor: '#7c3aed',
  borderColor: '#7c3aed44',
  tagBg: '#7c3aed22',
  tagText: '#a78bfa',
  icon: '🖼️',
  available: true,
}

describe('ToolCard', () => {
  it('도구 이름을 렌더링한다', () => {
    render(<ToolCard tool={mockTool} />)
    expect(screen.getByText('Favicon Generator')).toBeInTheDocument()
  })

  it('도구 설명을 렌더링한다', () => {
    render(<ToolCard tool={mockTool} />)
    expect(screen.getByText('favicon.ico 생성')).toBeInTheDocument()
  })

  it('태그를 렌더링한다', () => {
    render(<ToolCard tool={mockTool} />)
    expect(screen.getByText('.ico')).toBeInTheDocument()
    expect(screen.getByText('.png')).toBeInTheDocument()
  })

  it('available=true 일 때 링크를 렌더링한다', () => {
    render(<ToolCard tool={mockTool} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/tools/favicon')
  })

  it('available=false 일 때 Coming soon을 렌더링한다', () => {
    render(<ToolCard tool={{ ...mockTool, available: false }} />)
    expect(screen.getByText('Coming soon...')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
