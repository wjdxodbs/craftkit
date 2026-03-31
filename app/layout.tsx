import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
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
      <body className={`${syne.variable} ${dmSans.variable} antialiased`}>{children}</body>
    </html>
  )
}
