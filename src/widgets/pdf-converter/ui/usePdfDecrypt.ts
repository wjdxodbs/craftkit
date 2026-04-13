'use client'
import { useState } from 'react'
import { decryptPdf } from '@/features/pdf-encrypt/lib/encryptPdf'

export function usePdfDecrypt() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [password, setPassword] = useState('')
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
    setPassword('')
    setError(null)
  }

  const decrypt = async (): Promise<void> => {
    if (!pdfData || !password) return
    setIsProcessing(true)
    setError(null)
    try {
      const decrypted = await decryptPdf(pdfData, password)
      const blob = new Blob([decrypted as Uint8Array<ArrayBuffer>], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
        ? fileName.replace(/\.pdf$/i, '_decrypted.pdf')
        : 'decrypted.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('비밀번호가 올바르지 않거나 암호화된 PDF가 아닙니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    fileName,
    password,
    isProcessing,
    error,
    handleFile,
    reset,
    setPassword,
    decrypt,
  }
}
