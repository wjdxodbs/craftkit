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
    accentColor: '#fbbf24',
    borderColor: '#fbbf2444',
    tagBg: '#fbbf2422',
    tagText: '#fde68a',
    icon: '🖼️',
    available: true,
  },
  {
    id: 'og-image',
    name: 'OG Image Generator',
    description: '소셜 미리보기 이미지 1200×630 생성',
    href: '/tools/og-image',
    tags: ['1200×630', '.png'],
    accentColor: '#f59e0b',
    borderColor: '#f59e0b44',
    tagBg: '#f59e0b22',
    tagText: '#fcd34d',
    icon: '📸',
    available: true,
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'PNG · JPG · WebP 포맷 변환 + 품질 조정',
    href: '/tools/image-converter',
    tags: ['.png', '.jpg', '.webp'],
    accentColor: '#e9a109',
    borderColor: '#e9a10944',
    tagBg: '#e9a10922',
    tagText: '#fbbf24',
    icon: '🔄',
    available: true,
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: '이미지 크기 조절 + 포맷 변환',
    href: '/tools/image-resizer',
    tags: ['px', '.png', '.jpg', '.webp'],
    accentColor: '#d97706',
    borderColor: '#d9770644',
    tagBg: '#d9770622',
    tagText: '#f59e0b',
    icon: '📐',
    available: true,
  },
]
