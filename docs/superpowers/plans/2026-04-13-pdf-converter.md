# PDF Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이미지 → PDF 변환과 PDF → 이미지 변환 기능을 탭으로 제공하는 도구를 추가한다.

**Architecture:** FSD 레이어(features/lib → widgets/ui → views → app/page) 패턴을 따른다. 비즈니스 로직은 features/lib 순수 함수로 분리하고, UI 상태는 widgets/ui 훅에서 관리한다. pdf-lib으로 PDF를 생성하고 pdfjs-dist로 PDF를 렌더링한다.

**Tech Stack:** pdf-lib, pdfjs-dist, motion/react Reorder, fflate(기존 의존성), Next.js App Router

---

## File Map

| 경로 | 역할 |
|---|---|
| `src/features/image-to-pdf/lib/convertImagesToPdf.ts` | File[] → PDF Blob (pdf-lib) |
| `src/features/image-to-pdf/__tests__/convertImagesToPdf.test.ts` | 위 함수 테스트 |
| `src/features/pdf-to-image/lib/convertPdfToImages.ts` | ArrayBuffer + 페이지번호 → Blob (pdfjs-dist) |
| `src/features/pdf-to-image/__tests__/convertPdfToImages.test.ts` | 위 함수 테스트 |
| `src/widgets/pdf-converter/ui/PdfConverter.tsx` | 탭 상태 관리 + 레이아웃 |
| `src/widgets/pdf-converter/ui/useImageToPdf.ts` | 탭 A 변환 훅 |
| `src/widgets/pdf-converter/ui/ImageToPdfTab.tsx` | 탭 A UI |
| `src/widgets/pdf-converter/ui/usePdfToImage.ts` | 탭 B 렌더링/변환 훅 |
| `src/widgets/pdf-converter/ui/PdfToImageTab.tsx` | 탭 B UI |
| `src/views/pdf-converter-tool/ui/PdfConverterToolView.tsx` | 뷰 래퍼 |
| `app/tools/pdf-converter/page.tsx` | 라우트 페이지 |
| `src/shared/config/tools.ts` | pdf-converter 항목 추가 |

---

## Task 1: 패키지 설치

**Files:**
- 없음 (package.json 자동 수정)

- [ ] **Step 1: pdf-lib, pdfjs-dist 설치**

```bash
pnpm add pdf-lib pdfjs-dist
```

Expected: 설치 완료, pnpm-lock.yaml 업데이트

- [ ] **Step 2: 설치 확인**

```bash
pnpm list pdf-lib pdfjs-dist
```

Expected: 두 패키지 버전이 출력됨

- [ ] **Step 3: 커밋**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: pdf-lib, pdfjs-dist 패키지 추가"
```

---

## Task 2: convertImagesToPdf (TDD)

**Files:**
- Create: `src/features/image-to-pdf/__tests__/convertImagesToPdf.test.ts`
- Create: `src/features/image-to-pdf/lib/convertImagesToPdf.ts`

- [ ] **Step 1: 테스트 작성**

`src/features/image-to-pdf/__tests__/convertImagesToPdf.test.ts`:

```typescript
import { convertImagesToPdf } from '../lib/convertImagesToPdf'

const mockDrawImage = jest.fn()
const mockAddPage = jest.fn().mockReturnValue({ drawImage: mockDrawImage })
const mockEmbedPng = jest.fn().mockResolvedValue({ width: 200, height: 300 })
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46]))

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn().mockResolvedValue({
      addPage: mockAddPage,
      embedPng: mockEmbedPng,
      save: mockSave,
    }),
  },
}))

const mockBitmapClose = jest.fn()
global.createImageBitmap = jest.fn().mockResolvedValue({
  width: 200,
  height: 300,
  close: mockBitmapClose,
})

describe('convertImagesToPdf', () => {
  beforeEach(() => jest.clearAllMocks())

  it('File 배열로부터 PDF Blob을 생성한다', async () => {
    const file = new File(['data'], 'test.png', { type: 'image/png' })
    const result = await convertImagesToPdf([file])
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('application/pdf')
  })

  it('각 파일마다 PDF 페이지를 추가한다', async () => {
    const files = [
      new File(['a'], 'a.png', { type: 'image/png' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ]
    await convertImagesToPdf(files)
    expect(mockAddPage).toHaveBeenCalledTimes(2)
    expect(mockEmbedPng).toHaveBeenCalledTimes(2)
    expect(mockDrawImage).toHaveBeenCalledTimes(2)
  })

  it('페이지 크기를 이미지 크기에 맞춰 설정한다', async () => {
    const file = new File(['data'], 'test.png', { type: 'image/png' })
    await convertImagesToPdf([file])
    expect(mockAddPage).toHaveBeenCalledWith([200, 300])
    expect(mockDrawImage).toHaveBeenCalledWith({ x: 0, y: 0, width: 200, height: 300 })
  })

  it('빈 배열이면 빈 PDF를 반환한다', async () => {
    const result = await convertImagesToPdf([])
    expect(result).toBeInstanceOf(Blob)
    expect(mockAddPage).not.toHaveBeenCalled()
  })

  it('toBlob이 null을 반환하면 reject한다', async () => {
    ;(HTMLCanvasElement.prototype.toBlob as jest.Mock).mockImplementationOnce(
      (callback: BlobCallback) => callback(null)
    )
    const file = new File(['data'], 'test.png', { type: 'image/png' })
    await expect(convertImagesToPdf([file])).rejects.toThrow('canvas.toBlob 실패')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
pnpm test src/features/image-to-pdf/__tests__/convertImagesToPdf.test.ts
```

Expected: Cannot find module '../lib/convertImagesToPdf' 오류

- [ ] **Step 3: 구현**

`src/features/image-to-pdf/lib/convertImagesToPdf.ts`:

```typescript
import { PDFDocument } from 'pdf-lib'

async function fileToNormalizedPngBytes(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context 초기화 실패')
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('canvas.toBlob 실패'))
      blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)))
    }, 'image/png')
  })
}

export async function convertImagesToPdf(files: File[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()

  for (const file of files) {
    const pngBytes = await fileToNormalizedPngBytes(file)
    const pngImage = await pdfDoc.embedPng(pngBytes)
    const page = pdfDoc.addPage([pngImage.width, pngImage.height])
    page.drawImage(pngImage, { x: 0, y: 0, width: pngImage.width, height: pngImage.height })
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
pnpm test src/features/image-to-pdf/__tests__/convertImagesToPdf.test.ts
```

Expected: 5 tests passed

- [ ] **Step 5: 커밋**

```bash
git add src/features/image-to-pdf/
git commit -m "feat: convertImagesToPdf 함수 구현"
```

---

## Task 3: convertPdfToImages (TDD)

**Files:**
- Create: `src/features/pdf-to-image/__tests__/convertPdfToImages.test.ts`
- Create: `src/features/pdf-to-image/lib/convertPdfToImages.ts`

- [ ] **Step 1: 테스트 작성**

`src/features/pdf-to-image/__tests__/convertPdfToImages.test.ts`:

```typescript
import { getPdfPageCount, renderPdfPageToDataUrl, convertPdfPageToBlob } from '../lib/convertPdfToImages'

const mockRender = jest.fn().mockReturnValue({ promise: Promise.resolve() })
const mockGetViewport = jest.fn().mockReturnValue({ width: 100, height: 150 })
const mockGetPage = jest.fn().mockResolvedValue({
  getViewport: mockGetViewport,
  render: mockRender,
})
const mockDestroy = jest.fn().mockResolvedValue(undefined)

jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: jest.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 3,
      getPage: mockGetPage,
      destroy: mockDestroy,
    }),
  }),
}))

HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,abc')

describe('getPdfPageCount', () => {
  beforeEach(() => jest.clearAllMocks())

  it('PDF의 페이지 수를 반환한다', async () => {
    const data = new ArrayBuffer(8)
    const count = await getPdfPageCount(data)
    expect(count).toBe(3)
  })

  it('완료 후 PDF 문서를 destroy한다', async () => {
    const data = new ArrayBuffer(8)
    await getPdfPageCount(data)
    expect(mockDestroy).toHaveBeenCalled()
  })
})

describe('renderPdfPageToDataUrl', () => {
  beforeEach(() => jest.clearAllMocks())

  it('지정한 페이지를 data URL로 렌더링한다', async () => {
    const data = new ArrayBuffer(8)
    const result = await renderPdfPageToDataUrl(data, 1, 0.3)
    expect(typeof result).toBe('string')
    expect(mockGetPage).toHaveBeenCalledWith(1)
    expect(mockGetViewport).toHaveBeenCalledWith({ scale: 0.3 })
    expect(mockRender).toHaveBeenCalled()
  })
})

describe('convertPdfPageToBlob', () => {
  beforeEach(() => jest.clearAllMocks())

  it('지정한 페이지를 Blob으로 변환한다', async () => {
    const data = new ArrayBuffer(8)
    const result = await convertPdfPageToBlob(data, 2, 'image/jpeg', 0.9)
    expect(result).toBeInstanceOf(Blob)
    expect(mockGetPage).toHaveBeenCalledWith(2)
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.9
    )
  })

  it('toBlob이 null을 반환하면 reject한다', async () => {
    ;(HTMLCanvasElement.prototype.toBlob as jest.Mock).mockImplementationOnce(
      (callback: BlobCallback) => callback(null)
    )
    const data = new ArrayBuffer(8)
    await expect(convertPdfPageToBlob(data, 1, 'image/png', 1)).rejects.toThrow('canvas.toBlob 실패')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
pnpm test src/features/pdf-to-image/__tests__/convertPdfToImages.test.ts
```

Expected: Cannot find module '../lib/convertPdfToImages' 오류

- [ ] **Step 3: 구현**

`src/features/pdf-to-image/lib/convertPdfToImages.ts`:

```typescript
import type { OutputFormat } from '@/shared/config/image-formats'

async function getPdfjsLib() {
  const lib = await import('pdfjs-dist')
  try {
    if (!lib.GlobalWorkerOptions.workerSrc) {
      lib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString()
    }
  } catch {
    // 브라우저 외 환경(테스트 등)에서 import.meta.url 불가 시 무시
  }
  return lib
}

export async function getPdfPageCount(data: ArrayBuffer): Promise<number> {
  const pdfjsLib = await getPdfjsLib()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const count = pdf.numPages
  await pdf.destroy()
  return count
}

export async function renderPdfPageToDataUrl(
  data: ArrayBuffer,
  pageNumber: number,
  scale: number
): Promise<string> {
  const pdfjsLib = await getPdfjsLib()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context 초기화 실패')

  await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport }).promise

  const dataUrl = canvas.toDataURL()
  await pdf.destroy()
  return dataUrl
}

export async function convertPdfPageToBlob(
  data: ArrayBuffer,
  pageNumber: number,
  outputFormat: OutputFormat,
  quality: number,
  scale = 2
): Promise<Blob> {
  const pdfjsLib = await getPdfjsLib()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context 초기화 실패')

  await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport }).promise

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('canvas.toBlob 실패'))
        pdf.destroy().then(() => resolve(blob))
      },
      outputFormat,
      quality
    )
  })
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
pnpm test src/features/pdf-to-image/__tests__/convertPdfToImages.test.ts
```

Expected: 5 tests passed

- [ ] **Step 5: 커밋**

```bash
git add src/features/pdf-to-image/
git commit -m "feat: convertPdfToImages 함수 구현"
```

---

## Task 4: useImageToPdf 훅

**Files:**
- Create: `src/widgets/pdf-converter/ui/useImageToPdf.ts`

- [ ] **Step 1: 훅 작성**

`src/widgets/pdf-converter/ui/useImageToPdf.ts`:

```typescript
'use client'
import { useState } from 'react'
import { convertImagesToPdf } from '@/features/image-to-pdf/lib/convertImagesToPdf'

export interface ImageItem {
  id: string
  file: File
  previewUrl: string
}

export function useImageToPdf() {
  const [items, setItems] = useState<ImageItem[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addFiles = (files: File[]) => {
    const newItems: ImageItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setItems((prev) => [...prev, ...newItems])
    setError(null)
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
  }

  const reorder = (newItems: ImageItem[]) => {
    setItems(newItems)
  }

  const convert = async (): Promise<void> => {
    if (items.length === 0) return
    setIsConverting(true)
    setError(null)
    try {
      const blob = await convertImagesToPdf(items.map((i) => i.file))
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('PDF 변환에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setIsConverting(false)
    }
  }

  return { items, isConverting, error, addFiles, removeItem, reorder, convert }
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/widgets/pdf-converter/ui/useImageToPdf.ts
git commit -m "feat: useImageToPdf 훅 구현"
```

---

## Task 5: ImageToPdfTab 컴포넌트

**Files:**
- Create: `src/widgets/pdf-converter/ui/ImageToPdfTab.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/widgets/pdf-converter/ui/ImageToPdfTab.tsx`:

```typescript
'use client'
import { useRef } from 'react'
import { Reorder, motion } from 'motion/react'
import { useImageToPdf } from './useImageToPdf'
import type { ImageItem } from './useImageToPdf'

export function ImageToPdfTab() {
  const { items, isConverting, error, addFiles, removeItem, reorder, convert } = useImageToPdf()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) addFiles(files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length > 0) addFiles(files)
  }

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#ffffff20] bg-[#0c0c0c] transition-colors hover:border-[#a78bfa66] hover:shadow-[0_0_24px_-4px_#a78bfa15]"
      >
        <svg
          className="size-8 text-[#a78bfa44]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm text-[#777]">클릭하거나 드래그해서 이미지 추가</p>
        <p className="text-xs text-[#444]">PNG, JPG, WebP 등 — 여러 장 동시 선택 가능</p>
      </button>

      {items.length > 0 && (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={reorder}
          className="space-y-2"
        >
          {items.map((item: ImageItem) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className="cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-3 rounded-[12px] border border-[#ffffff15] bg-[#0c0c0c] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="h-12 w-12 rounded-[8px] object-cover"
                />
                <span className="flex-1 truncate text-sm text-[#bbb]">{item.file.name}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-[#555] transition-colors hover:text-[#ff6b6b]"
                  aria-label={`${item.file.name} 삭제`}
                >
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <motion.div whileTap={{ scale: 0.98 }}>
        <button
          onClick={convert}
          disabled={items.length === 0 || isConverting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#a78bfa40] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#a78bfa] transition-all hover:border-[#a78bfa60] hover:bg-[#a78bfa10] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isConverting ? '처리 중…' : `PDF로 변환 · 다운로드 (${items.length}장)`}
        </button>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/widgets/pdf-converter/ui/ImageToPdfTab.tsx
git commit -m "feat: ImageToPdfTab 컴포넌트 구현"
```

---

## Task 6: usePdfToImage 훅

**Files:**
- Create: `src/widgets/pdf-converter/ui/usePdfToImage.ts`

- [ ] **Step 1: 훅 작성**

`src/widgets/pdf-converter/ui/usePdfToImage.ts`:

```typescript
'use client'
import { useState } from 'react'
import {
  getPdfPageCount,
  renderPdfPageToDataUrl,
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
      const count = await getPdfPageCount(data)

      const initialPages: PageItem[] = Array.from({ length: count }, (_, i) => ({
        pageNumber: i + 1,
        thumbnailUrl: '',
        isLoading: true,
      }))
      setPages(initialPages)

      for (let i = 0; i < count; i++) {
        const thumbnailUrl = await renderPdfPageToDataUrl(data, i + 1, 0.3)
        setPages((prev) =>
          prev.map((p) =>
            p.pageNumber === i + 1 ? { ...p, thumbnailUrl, isLoading: false } : p
          )
        )
      }
    } catch {
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
```

- [ ] **Step 2: 커밋**

```bash
git add src/widgets/pdf-converter/ui/usePdfToImage.ts
git commit -m "feat: usePdfToImage 훅 구현"
```

---

## Task 7: PdfToImageTab 컴포넌트

**Files:**
- Create: `src/widgets/pdf-converter/ui/PdfToImageTab.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/widgets/pdf-converter/ui/PdfToImageTab.tsx`:

```typescript
'use client'
import { useRef } from 'react'
import { motion } from 'motion/react'
import { usePdfToImage } from './usePdfToImage'
import type { PageItem } from './usePdfToImage'
import { OUTPUT_FORMATS } from '@/shared/config/image-formats'
import { labelCls, segBtn } from '@/shared/ui/styles'

export function PdfToImageTab() {
  const {
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
  } = usePdfToImage()
  const inputRef = useRef<HTMLInputElement>(null)

  const allSelected = pages.length > 0 && selectedPages.size === pages.length

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') handleFile(file)
  }

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#ffffff20] bg-[#0c0c0c] transition-colors hover:border-[#a78bfa66] hover:shadow-[0_0_24px_-4px_#a78bfa15]"
      >
        {fileName ? (
          <>
            <p className="max-w-full truncate px-4 text-sm text-white/70">{fileName}</p>
            <p className="text-xs text-white/30">클릭하여 변경</p>
          </>
        ) : (
          <>
            <svg
              className="size-8 text-[#a78bfa44]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm text-[#777]">클릭하거나 드래그해서 PDF 업로드</p>
            <p className="text-xs text-[#444]">application/pdf</p>
          </>
        )}
      </button>

      {pages.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className={labelCls}>
              {pages.length}페이지 · {selectedPages.size}개 선택
            </span>
            <button
              type="button"
              onClick={allSelected ? deselectAll : selectAll}
              className="text-xs text-[#a78bfa] hover:underline"
            >
              {allSelected ? '전체 해제' : '전체 선택'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {pages.map((page: PageItem) => (
              <button
                key={page.pageNumber}
                type="button"
                onClick={() => togglePage(page.pageNumber)}
                className={`relative overflow-hidden rounded-[10px] border-2 transition-all ${
                  selectedPages.has(page.pageNumber)
                    ? 'border-[#a78bfa]'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                aria-label={`페이지 ${page.pageNumber} ${selectedPages.has(page.pageNumber) ? '선택됨' : '선택 안됨'}`}
              >
                {page.isLoading ? (
                  <div className="flex aspect-[3/4] items-center justify-center bg-[#111]">
                    <div className="size-5 animate-spin rounded-full border-2 border-[#a78bfa] border-t-transparent" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={page.thumbnailUrl}
                    alt={`페이지 ${page.pageNumber}`}
                    className="w-full object-cover"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-center text-[10px] text-white/70">
                  {page.pageNumber}
                </div>
                {selectedPages.has(page.pageNumber) && (
                  <div className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-[#a78bfa]">
                    <svg
                      className="size-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="white"
                      strokeWidth={3}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {pages.length > 0 && (
        <div className="space-y-3 rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
          <div className="space-y-2">
            <p className={labelCls}>출력 포맷</p>
            <div className="flex gap-2">
              {OUTPUT_FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={segBtn(outputFormat === f.value)}
                  onClick={() => setOutputFormat(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {outputFormat !== 'image/png' && (
            <div className="space-y-2">
              <p className={labelCls}>품질 {quality}%</p>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[#a78bfa]"
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <motion.div whileTap={{ scale: 0.98 }}>
        <button
          onClick={convert}
          disabled={selectedPages.size === 0 || isConverting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#a78bfa40] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#a78bfa] transition-all hover:border-[#a78bfa60] hover:bg-[#a78bfa10] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isConverting
            ? '처리 중…'
            : selectedPages.size > 1
              ? `이미지로 변환 · ZIP 다운로드 (${selectedPages.size}장)`
              : '이미지로 변환 · 다운로드'}
        </button>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/widgets/pdf-converter/ui/PdfToImageTab.tsx
git commit -m "feat: PdfToImageTab 컴포넌트 구현"
```

---

## Task 8: PdfConverter 메인 위젯

**Files:**
- Create: `src/widgets/pdf-converter/ui/PdfConverter.tsx`

- [ ] **Step 1: 메인 위젯 작성**

`src/widgets/pdf-converter/ui/PdfConverter.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { ImageToPdfTab } from './ImageToPdfTab'
import { PdfToImageTab } from './PdfToImageTab'
import { segBtn } from '@/shared/ui/styles'

type Tab = 'image-to-pdf' | 'pdf-to-image'

export function PdfConverter() {
  const [activeTab, setActiveTab] = useState<Tab>('image-to-pdf')

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <button
          type="button"
          className={segBtn(activeTab === 'image-to-pdf')}
          onClick={() => setActiveTab('image-to-pdf')}
        >
          이미지 → PDF
        </button>
        <button
          type="button"
          className={segBtn(activeTab === 'pdf-to-image')}
          onClick={() => setActiveTab('pdf-to-image')}
        >
          PDF → 이미지
        </button>
      </div>

      {activeTab === 'image-to-pdf' ? <ImageToPdfTab /> : <PdfToImageTab />}
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/widgets/pdf-converter/ui/PdfConverter.tsx
git commit -m "feat: PdfConverter 메인 위젯 구현"
```

---

## Task 9: 뷰, 페이지, tools.ts 등록

**Files:**
- Create: `src/views/pdf-converter-tool/ui/PdfConverterToolView.tsx`
- Create: `app/tools/pdf-converter/page.tsx`
- Modify: `src/shared/config/tools.ts`

- [ ] **Step 1: 뷰 래퍼 작성**

`src/views/pdf-converter-tool/ui/PdfConverterToolView.tsx`:

```typescript
import { PdfConverter } from '@/widgets/pdf-converter/ui/PdfConverter'
import { ToolHeader } from '@/shared/ui/ToolHeader'
import { TOOLS } from '@/shared/config/tools'

export function PdfConverterToolView() {
  const tool = TOOLS.find((t) => t.id === 'pdf-converter')!
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 md:px-16">
      <ToolHeader name={tool.name} description={tool.description} accentColor={tool.accentColor} />
      <PdfConverter />
    </div>
  )
}
```

- [ ] **Step 2: 페이지 작성**

`app/tools/pdf-converter/page.tsx`:

```typescript
import type { Metadata } from 'next'
import { PdfConverterToolView } from '@/views/pdf-converter-tool/ui/PdfConverterToolView'

export const metadata: Metadata = {
  title: 'PDF Converter — Craftkit',
  description: '이미지를 PDF로, PDF를 이미지로 변환. 브라우저에서만 처리, 서버 업로드 없음.',
  openGraph: {
    title: 'PDF Converter — Craftkit',
    description: '이미지를 PDF로, PDF를 이미지로 변환. 브라우저에서만 처리, 서버 업로드 없음.',
    images: ['/og-image.png'],
  },
}

export default function PdfConverterPage() {
  return <PdfConverterToolView />
}
```

- [ ] **Step 3: tools.ts에 항목 추가**

`src/shared/config/tools.ts`의 TOOLS 배열 맨 끝(color-converter 항목 다음)에 추가:

```typescript
  {
    id: 'pdf-converter',
    name: 'PDF Converter',
    description: '이미지 → PDF, PDF → 이미지 변환',
    href: '/tools/pdf-converter',
    tags: ['.pdf', '.png', '.jpg', '.webp'],
    accentColor: '#a78bfa',
    borderColor: '#a78bfa22',
    tagBg: '#a78bfa0c',
    tagText: '#a78bfa88',
    icon: 'FileText',
    available: true,
  },
```

- [ ] **Step 4: 커밋**

```bash
git add src/views/pdf-converter-tool/ app/tools/pdf-converter/ src/shared/config/tools.ts
git commit -m "feat: PDF Converter 뷰, 페이지, 도구 목록 등록"
```

---

## Task 10: 빌드 및 동작 검증

- [ ] **Step 1: 전체 테스트 실행**

```bash
pnpm test
```

Expected: 기존 테스트 모두 통과, 새로 추가한 테스트도 통과

- [ ] **Step 2: 타입 체크 및 빌드**

```bash
pnpm build
```

Expected: 빌드 성공. 실패 시 오류 메시지 확인 후 수정:
- `pdfjs-dist` 타입 오류 → `tsconfig.json`에 타입 선언 확인
- `import.meta.url` 오류 → `tsconfig.json`의 `"module"` 또는 `"moduleResolution"` 설정 확인
- 워커 관련 번들 오류 → `next.config.ts`에서 `transpilePackages: ['pdfjs-dist']` 추가 시도

- [ ] **Step 3: 개발 서버에서 동작 확인**

```bash
pnpm dev
```

브라우저에서 http://localhost:3000/tools/pdf-converter 접속 후 확인:
1. 홈 화면 카드 그리드에 PDF Converter 카드 노출 확인
2. 탭 A: 이미지 여러 장 업로드 → 드래그 순서 변경 → PDF 다운로드
3. 탭 B: PDF 업로드 → 페이지 썸네일 렌더링 확인 → 페이지 선택 → 이미지/ZIP 다운로드
4. 탭 전환 시 상태 초기화 확인 (탭 A에서 B로 전환 시 이전 파일 없음)

> **pdfjs-dist 워커 문제 발생 시:** 브라우저 콘솔에 워커 오류가 나타나면 `src/features/pdf-to-image/lib/convertPdfToImages.ts`의 `workerSrc` 설정을 CDN URL로 변경:
> ```typescript
> lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`
> ```
