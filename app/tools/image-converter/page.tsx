import type { Metadata } from 'next'
import { ImageConverterToolView } from '@/views/image-converter-tool/ui/ImageConverterToolView'

export const metadata: Metadata = {
  title: 'Image Converter — Craftkit',
  description: 'Convert PNG, JPG, and WebP images in your browser. No upload.',
  openGraph: {
    title: 'Image Converter — Craftkit',
    description: 'Convert PNG, JPG, and WebP images in your browser. No upload.',
    images: ['/og-image.png'],
  },
}

export default function ImageConverterPage() {
  return <ImageConverterToolView />
}
