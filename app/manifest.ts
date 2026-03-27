import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Craftkit',
    short_name: 'Craftkit',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    start_url: '/',
    display: 'standalone',
    background_color: '#111110',
    theme_color: '#f59e0b',
  }
}
