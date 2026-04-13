'use client'
import { useState } from 'react'
import { encryptPdf } from '@/features/pdf-encrypt/lib/encryptPdf'

export function usePdfEncrypt() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [userPassword, setUserPassword] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File): Promise<void> => {
    try {
      const data = await file.arrayBuffer()
      setPdfData(data)
      setFileName(file.name)
      setError(null)
    } catch {
      setError('파일을 읽는 데 실패했습니다.')
    }
  }

  const reset = (): void => {
    setPdfData(null)
    setFileName(null)
    setUserPassword('')
    setOwnerPassword('')
    setError(null)
  }

  const encrypt = async (): Promise<void> => {
    if (!pdfData || !userPassword) return
    setIsProcessing(true)
    setError(null)
    try {
      const encrypted = await encryptPdf(
        pdfData,
        userPassword,
        ownerPassword || undefined
      )
      const blob = new Blob([encrypted as Uint8Array<ArrayBuffer>], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
        ? fileName.replace(/\.pdf$/i, '_encrypted.pdf')
        : 'encrypted.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('PDF 암호 설정에 실패했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    fileName,
    userPassword,
    ownerPassword,
    isProcessing,
    error,
    handleFile,
    reset,
    setUserPassword,
    setOwnerPassword,
    encrypt,
  }
}
