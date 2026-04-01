import type { Metadata } from 'next'
import { ImageCropperToolView } from '@/views/image-cropper-tool/ui/ImageCropperToolView'

export const metadata: Metadata = {
  title: 'Image Cropper — Craftkit',
  description: 'Crop and convert PNG, JPG, and WebP images in your browser. No upload.',
  openGraph: {
    title: 'Image Cropper — Craftkit',
    description: 'Crop and convert PNG, JPG, and WebP images in your browser. No upload.',
    images: ['/og-image.png'],
  },
}

export default function ImageCropperPage() {
  return <ImageCropperToolView />
}
