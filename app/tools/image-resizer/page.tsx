import type { Metadata } from 'next'
import { ImageResizerToolView } from '@/views/image-resizer-tool/ui/ImageResizerToolView'

export const metadata: Metadata = {
  title: 'Image Resizer — Craftkit',
  description: 'Resize images to any dimension and export as PNG, JPG, or WebP. No upload.',
  openGraph: {
    title: 'Image Resizer — Craftkit',
    description: 'Resize images to any dimension and export as PNG, JPG, or WebP. No upload.',
    images: ['/og-image.png'],
  },
}

export default function ImageResizerPage() {
  return <ImageResizerToolView />
}
