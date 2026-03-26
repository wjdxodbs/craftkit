import type { Metadata } from 'next'
import { ImageConverterToolView } from '@/views/image-converter-tool/ui/ImageConverterToolView'

export const metadata: Metadata = {
  title: 'Image Converter — Craftkit',
}

export default function ImageConverterPage() {
  return <ImageConverterToolView />
}
