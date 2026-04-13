import type { Metadata } from 'next'
import { PdfEncryptorToolView } from '@/views/pdf-encryptor-tool/ui/PdfEncryptorToolView'

export const metadata: Metadata = {
  title: 'PDF Password — Craftkit',
  description: 'PDF 암호 설정 및 해제. 브라우저에서 처리, 업로드 없음.',
  openGraph: {
    title: 'PDF Password — Craftkit',
    description: 'PDF 암호 설정 및 해제. 브라우저에서 처리, 업로드 없음.',
    images: ['/og-image.png'],
  },
}

export default function PdfPasswordPage() {
  return <PdfEncryptorToolView />
}
