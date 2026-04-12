import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

export const viewport: Viewport = {
  themeColor: '#050505',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://wjdxodbs-craftkit.vercel.app'),
  title: 'Craftkit',
  description: 'Simple tools for developers & designers. No signup. No upload.',
  icons: {
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Craftkit',
    description: 'Simple tools for developers & designers. No signup. No upload.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  )
}
