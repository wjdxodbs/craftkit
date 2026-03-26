import { render, screen, fireEvent } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { TOOLS } from '@/shared/config/tools'
import { Sidebar } from '../ui/Sidebar'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('motion/react', () => ({
  motion: {
    nav: ({ children, ...props }: React.ComponentPropsWithoutRef<'nav'>) => <nav {...props}>{children}</nav>,
    span: ({ children, ...props }: React.ComponentPropsWithoutRef<'span'>) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Sidebar', () => {
  describe('렌더링', () => {
    it('CRAFTKIT 로고 링크가 "/"를 가리킨다', () => {
      render(<Sidebar />)
      expect(screen.getByRole('link', { name: /CRAFTKIT/ })).toHaveAttribute('href', '/')
    })

    it('available한 모든 툴을 렌더링한다', () => {
      render(<Sidebar />)
      const availableTools = TOOLS.filter((tool) => tool.available)
      availableTools.forEach((tool) => {
        expect(screen.getByText(tool.name)).toBeInTheDocument()
      })
    })

    it('available: false인 툴은 렌더링하지 않는다', () => {
      render(<Sidebar />)
      const unavailableTools = TOOLS.filter((tool) => !tool.available)
      unavailableTools.forEach((tool) => {
        expect(screen.queryByText(tool.name)).not.toBeInTheDocument()
      })
    })

    it('토글 버튼이 렌더링된다', () => {
      render(<Sidebar />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Collapse/Expand', () => {
    it('기본 상태에서 토글 버튼 aria-label이 "Collapse sidebar"이다', () => {
      render(<Sidebar />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Collapse sidebar')
    })

    it('토글 클릭 후 aria-label이 "Expand sidebar"로 바뀐다', () => {
      render(<Sidebar />)
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Expand sidebar')
    })

    it('두 번 클릭 후 aria-label이 "Collapse sidebar"로 돌아온다', () => {
      render(<Sidebar />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Collapse sidebar')
    })
  })

  describe('Active State', () => {
    it('pathname이 일치하는 툴 링크에 aria-current="page"가 적용된다', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/tools/favicon')
      render(<Sidebar />)
      const faviconTool = TOOLS.find((tool) => tool.href === '/tools/favicon')!
      expect(screen.getByRole('link', { name: new RegExp(faviconTool.name) })).toHaveAttribute(
        'aria-current',
        'page',
      )
    })

    it('pathname이 일치하지 않는 툴 링크에 aria-current가 없다', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/tools/favicon')
      render(<Sidebar />)
      const ogImageTool = TOOLS.find((tool) => tool.href === '/tools/og-image')!
      expect(screen.getByRole('link', { name: new RegExp(ogImageTool.name) })).not.toHaveAttribute(
        'aria-current',
      )
    })
  })
})
