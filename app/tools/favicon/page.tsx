import type { Metadata } from 'next'
import { FaviconToolView } from '@/views/favicon-tool/ui/FaviconToolView'

export const metadata: Metadata = {
  title: 'Favicon Generator — Craftkit',
}

export default function FaviconPage() {
  return <FaviconToolView />
}
