import type { Metadata } from 'next'
import { ImageResizerToolView } from '@/views/image-resizer-tool/ui/ImageResizerToolView'

export const metadata: Metadata = {
  title: 'Image Resizer — Craftkit',
}

export default function ImageResizerPage() {
  return <ImageResizerToolView />
}
