export interface Tool {
  id: string
  name: string
  description: string
  href: string
  tags: string[]
  accentColor: string
  borderColor: string
  tagBg: string
  tagText: string
  icon: string
  available: boolean
}

export const TOOLS: Tool[] = [
  {
    id: 'favicon',
    name: 'Favicon Generator',
    description: 'favicon.ico, Apple, Android 아이콘 생성',
    href: '/tools/favicon',
    tags: ['.ico', '.png', '.zip'],
    accentColor: '#7c3aed',
    borderColor: '#7c3aed44',
    tagBg: '#7c3aed22',
    tagText: '#a78bfa',
    icon: '🖼️',
    available: true,
  },
  {
    id: 'og-image',
    name: 'OG Image Generator',
    description: '소셜 미리보기 이미지 1200×630 생성',
    href: '/tools/og-image',
    tags: ['1200×630', '.png'],
    accentColor: '#3b82f6',
    borderColor: '#3b82f644',
    tagBg: '#3b82f622',
    tagText: '#93c5fd',
    icon: '📸',
    available: true,
  },
]
