'use client'
import { useState } from 'react'
import {
  renderAllThumbnails,
  convertPdfPageToBlob,
} from '@/features/pdf-to-image/lib/convertPdfToImages'
import { createZip, downloadBlob } from '@/shared/lib/zip'
import { EXT_MAP, type OutputFormat } from '@/shared/config/image-formats'

export interface PageItem {
  pageNumber: number
  thumbnailUrl: string
  isLoading: boolean
}

export function usePdfToImage() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pages, setPages] = useState<PageItem[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png')
  const [quality, setQuality] = useState(90)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File): Promise<void> => {
    setError(null)
    setPages([])
    setSelectedPages(new Set())
    setFileName(file.name)

    try {
      const data = await file.arrayBuffer()
      setPdfData(data)

      await renderAllThumbnails(
        data,
        0.3,
        (count) => {
          setPages(
            Array.from({ length: count }, (_, i) => ({
              pageNumber: i + 1,
              thumbnailUrl: '',
              isLoading: true,
            }))
          )
        },
        (pageNumber, thumbnailUrl) => {
          setPages((prev) =>
            prev.map((p) =>
              p.pageNumber === pageNumber ? { ...p, thumbnailUrl, isLoading: false } : p
            )
          )
        }
      )
    } catch (err) {
      console.error('[usePdfToImage] handleFile error:', err)
      setError('PDF 파일을 불러오지 못했습니다. 암호화된 PDF는 지원하지 않습니다.')
    }
  }

  const togglePage = (pageNumber: number): void => {
    setSelectedPages((prev) => {
      const next = new Set(prev)
      if (next.has(pageNumber)) next.delete(pageNumber)
      else next.add(pageNumber)
      return next
    })
  }

  const selectAll = (): void => {
    setSelectedPages(new Set(pages.map((p) => p.pageNumber)))
  }

  const deselectAll = (): void => {
    setSelectedPages(new Set())
  }

  const convert = async (): Promise<void> => {
    if (!pdfData || selectedPages.size === 0) return
    setIsConverting(true)
    setError(null)

    try {
      const sorted = [...selectedPages].sort((a, b) => a - b)
      const blobs = await Promise.all(
        sorted.map((pageNumber) =>
          convertPdfPageToBlob(pdfData, pageNumber, outputFormat, quality / 100)
        )
      )

      const ext = EXT_MAP[outputFormat]

      if (blobs.length === 1) {
        const url = URL.createObjectURL(blobs[0])
        const a = document.createElement('a')
        a.href = url
        a.download = `page-${sorted[0]}.${ext}`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const entries: Record<string, Uint8Array> = {}
        for (let i = 0; i < blobs.length; i++) {
          const buf = await blobs[i].arrayBuffer()
          entries[`page-${sorted[i]}.${ext}`] = new Uint8Array(buf)
        }
        const zip = createZip(entries)
        downloadBlob('pages.zip', zip)
      }
    } catch {
      setError('이미지 변환에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setIsConverting(false)
    }
  }

  return {
    fileName,
    pages,
    selectedPages,
    outputFormat,
    quality,
    isConverting,
    error,
    handleFile,
    togglePage,
    selectAll,
    deselectAll,
    setOutputFormat,
    setQuality,
    convert,
  }
}
