import type { Metadata } from 'next'
import { OgImageToolView } from '@/views/og-image-tool/ui/OgImageToolView'

export const metadata: Metadata = {
  title: 'OG Image Generator — Craftkit',
}

export default function OgImagePage() {
  return <OgImageToolView />
}
