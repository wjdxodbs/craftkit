# PDF 암호 설정 / 해제 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PDF Converter에 암호 설정(encrypt)과 암호 해제(decrypt) 탭 2개를 추가한다.

**Architecture:** `pdf-lib`의 `PDFDocument.load({ password })` / `save({ userPassword, ownerPassword })`를 순수 함수로 래핑하고, 기존 훅+컴포넌트 패턴을 그대로 따른다. 탭은 PdfConverter.tsx의 Tab union type에 `'pdf-encrypt' | 'pdf-decrypt'`를 추가해 조건부 렌더링한다.

**Tech Stack:** pdf-lib@1.17.1 (기설치), React 19, TypeScript, Tailwind v4, Jest

---

## 파일 구조

**신규 생성**
- `src/features/pdf-encrypt/lib/encryptPdf.ts` — `encryptPdf`, `decryptPdf` 순수 함수
- `src/features/pdf-encrypt/__tests__/encryptPdf.test.ts` — 단위 테스트
- `src/widgets/pdf-converter/ui/usePdfEncrypt.ts` — 암호 설정 훅
- `src/widgets/pdf-converter/ui/usePdfDecrypt.ts` — 암호 해제 훅
- `src/widgets/pdf-converter/ui/PdfEncryptTab.tsx` — 암호 설정 탭 컴포넌트
- `src/widgets/pdf-converter/ui/PdfDecryptTab.tsx` — 암호 해제 탭 컴포넌트

**수정**
- `src/widgets/pdf-converter/ui/PdfConverter.tsx` — Tab 타입 확장, 탭 버튼·렌더링 추가

---

## Task 1: encryptPdf / decryptPdf 순수 함수 TDD

**Files:**
- Create: `src/features/pdf-encrypt/lib/encryptPdf.ts`
- Create: `src/features/pdf-encrypt/__tests__/encryptPdf.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

```ts
// src/features/pdf-encrypt/__tests__/encryptPdf.test.ts
import { PDFDocument } from 'pdf-lib'
import { encryptPdf, decryptPdf } from '../encryptPdf'

async function createTestPdfBytes(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create()
  doc.addPage([100, 100])
  const bytes = await doc.save()
  return (bytes.buffer as ArrayBuffer).slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  )
}

describe('encryptPdf', () => {
  it('비밀번호 없이 로드하면 실패한다', async () => {
    const pdfBytes = await createTestPdfBytes()
    const encrypted = await encryptPdf(pdfBytes, 'secret', 'owner')
    await expect(PDFDocument.load(encrypted)).rejects.toThrow()
  })

  it('올바른 유저 비밀번호로 로드 성공한다', async () => {
    const pdfBytes = await createTestPdfBytes()
    const encrypted = await encryptPdf(pdfBytes, 'secret', 'owner')
    const doc = await PDFDocument.load(encrypted, { password: 'secret' })
    expect(doc.getPageCount()).toBe(1)
  })

  it('ownerPassword 생략 시 userPassword와 동일하게 처리된다', async () => {
    const pdfBytes = await createTestPdfBytes()
    const encrypted = await encryptPdf(pdfBytes, 'only')
    const doc = await PDFDocument.load(encrypted, { password: 'only' })
    expect(doc.getPageCount()).toBe(1)
  })
})

describe('decryptPdf', () => {
  it('올바른 비밀번호로 암호 해제 후 비밀번호 없이 로드 성공한다', async () => {
    const pdfBytes = await createTestPdfBytes()
    const encrypted = await encryptPdf(pdfBytes, 'secret', 'owner')
    const decrypted = await decryptPdf(
      (encrypted.buffer as ArrayBuffer).slice(
        encrypted.byteOffset,
        encrypted.byteOffset + encrypted.byteLength
      ),
      'secret'
    )
    const doc = await PDFDocument.load(decrypted)
    expect(doc.getPageCount()).toBe(1)
  })

  it('잘못된 비밀번호로 해제 시 에러를 던진다', async () => {
    const pdfBytes = await createTestPdfBytes()
    const encrypted = await encryptPdf(pdfBytes, 'secret', 'owner')
    await expect(
      decryptPdf(
        (encrypted.buffer as ArrayBuffer).slice(
          encrypted.byteOffset,
          encrypted.byteOffset + encrypted.byteLength
        ),
        'wrong'
      )
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
pnpm test src/features/pdf-encrypt/__tests__/encryptPdf.test.ts
```

Expected: `encryptPdf` is not a function (또는 모듈 없음 오류)

- [ ] **Step 3: 구현 파일 작성**

```ts
// src/features/pdf-encrypt/lib/encryptPdf.ts
import { PDFDocument } from 'pdf-lib'

export async function encryptPdf(
  data: ArrayBuffer,
  userPassword: string,
  ownerPassword?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(data.slice(0))
  return pdfDoc.save({
    userPassword,
    ownerPassword: ownerPassword ?? userPassword,
  })
}

export async function decryptPdf(
  data: ArrayBuffer,
  password: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(data.slice(0), { password })
  return pdfDoc.save()
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
pnpm test src/features/pdf-encrypt/__tests__/encryptPdf.test.ts
```

Expected: 4 tests passed

- [ ] **Step 5: 커밋**

```bash
git add src/features/pdf-encrypt/
git commit -m "feat: encryptPdf / decryptPdf 순수 함수 구현"
```

---

## Task 2: usePdfEncrypt 훅

**Files:**
- Create: `src/widgets/pdf-converter/ui/usePdfEncrypt.ts`

- [ ] **Step 1: 훅 작성**

```ts
// src/widgets/pdf-converter/ui/usePdfEncrypt.ts
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
    const data = await file.arrayBuffer()
    setPdfData(data)
    setFileName(file.name)
    setError(null)
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
      const blob = new Blob([encrypted], { type: 'application/pdf' })
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
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/widgets/pdf-converter/ui/usePdfEncrypt.ts
git commit -m "feat: usePdfEncrypt 훅 구현"
```

---

## Task 3: PdfEncryptTab 컴포넌트

**Files:**
- Create: `src/widgets/pdf-converter/ui/PdfEncryptTab.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
// src/widgets/pdf-converter/ui/PdfEncryptTab.tsx
'use client'
import { motion } from 'motion/react'
import { usePdfEncrypt } from './usePdfEncrypt'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
import { labelCls } from '@/shared/ui/styles'

const inputCls =
  'w-full rounded-[10px] border border-[#ffffff15] bg-[#131313] px-3 py-2 text-sm text-white placeholder-[#555] outline-none transition-colors focus:border-[#a78bfa40]'

export function PdfEncryptTab() {
  const {
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
  } = usePdfEncrypt()

  if (!fileName) {
    return (
      <ImageUpload
        accept="application/pdf"
        hint="암호를 설정할 PDF 업로드"
        size="lg"
        onFiles={(files) => { if (files[0]) handleFile(files[0]) }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* 파일 정보 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#fff]">{fileName}</h3>
        <button
          type="button"
          onClick={reset}
          className="text-xs text-[#a78bfa] hover:text-[#c9b0ff]"
        >
          파일 교체
        </button>
      </div>

      {/* 비밀번호 입력 */}
      <div className="space-y-3 rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
        <div className="space-y-2">
          <p className={labelCls}>유저 비밀번호 (필수)</p>
          <input
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            placeholder="PDF를 열 때 필요한 비밀번호"
            className={inputCls}
          />
        </div>
        <div className="space-y-2">
          <p className={labelCls}>소유자 비밀번호 (선택)</p>
          <input
            type="password"
            value={ownerPassword}
            onChange={(e) => setOwnerPassword(e.target.value)}
            placeholder="미입력 시 유저 비밀번호와 동일"
            className={inputCls}
          />
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-[14px] border border-[#ef444415] bg-[#ef44440a] p-3 text-xs text-[#ff6b6b]">
          {error}
        </div>
      )}

      {/* 다운로드 버튼 */}
      <motion.div whileTap={{ scale: 0.98 }}>
        <button
          onClick={encrypt}
          disabled={!userPassword || isProcessing}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#a78bfa40] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#a78bfa] transition-all hover:border-[#a78bfa60] hover:bg-[#a78bfa10] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isProcessing ? '처리 중…' : '암호 설정 · 다운로드'}
        </button>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/widgets/pdf-converter/ui/PdfEncryptTab.tsx
git commit -m "feat: PdfEncryptTab 컴포넌트 구현"
```

---

## Task 4: usePdfDecrypt 훅

**Files:**
- Create: `src/widgets/pdf-converter/ui/usePdfDecrypt.ts`

- [ ] **Step 1: 훅 작성**

```ts
// src/widgets/pdf-converter/ui/usePdfDecrypt.ts
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
    const data = await file.arrayBuffer()
    setPdfData(data)
    setFileName(file.name)
    setError(null)
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
      const blob = new Blob([decrypted], { type: 'application/pdf' })
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
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/widgets/pdf-converter/ui/usePdfDecrypt.ts
git commit -m "feat: usePdfDecrypt 훅 구현"
```

---

## Task 5: PdfDecryptTab 컴포넌트

**Files:**
- Create: `src/widgets/pdf-converter/ui/PdfDecryptTab.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
// src/widgets/pdf-converter/ui/PdfDecryptTab.tsx
'use client'
import { motion } from 'motion/react'
import { usePdfDecrypt } from './usePdfDecrypt'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
import { labelCls } from '@/shared/ui/styles'

const inputCls =
  'w-full rounded-[10px] border border-[#ffffff15] bg-[#131313] px-3 py-2 text-sm text-white placeholder-[#555] outline-none transition-colors focus:border-[#a78bfa40]'

export function PdfDecryptTab() {
  const {
    fileName,
    password,
    isProcessing,
    error,
    handleFile,
    reset,
    setPassword,
    decrypt,
  } = usePdfDecrypt()

  if (!fileName) {
    return (
      <ImageUpload
        accept="application/pdf"
        hint="암호를 해제할 PDF 업로드"
        size="lg"
        onFiles={(files) => { if (files[0]) handleFile(files[0]) }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* 파일 정보 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#fff]">{fileName}</h3>
        <button
          type="button"
          onClick={reset}
          className="text-xs text-[#a78bfa] hover:text-[#c9b0ff]"
        >
          파일 교체
        </button>
      </div>

      {/* 비밀번호 입력 */}
      <div className="space-y-2 rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
        <p className={labelCls}>비밀번호</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') decrypt() }}
          placeholder="PDF 비밀번호 입력"
          className={inputCls}
        />
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-[14px] border border-[#ef444415] bg-[#ef44440a] p-3 text-xs text-[#ff6b6b]">
          {error}
        </div>
      )}

      {/* 다운로드 버튼 */}
      <motion.div whileTap={{ scale: 0.98 }}>
        <button
          onClick={decrypt}
          disabled={!password || isProcessing}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#a78bfa40] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#a78bfa] transition-all hover:border-[#a78bfa60] hover:bg-[#a78bfa10] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isProcessing ? '처리 중…' : '암호 해제 · 다운로드'}
        </button>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/widgets/pdf-converter/ui/PdfDecryptTab.tsx
git commit -m "feat: PdfDecryptTab 컴포넌트 구현"
```

---

## Task 6: PdfConverter.tsx 탭 확장 + 통합

**Files:**
- Modify: `src/widgets/pdf-converter/ui/PdfConverter.tsx`

- [ ] **Step 1: PdfConverter.tsx 전체 교체**

```tsx
// src/widgets/pdf-converter/ui/PdfConverter.tsx
'use client'
import { useState } from 'react'
import { ImageToPdfTab } from './ImageToPdfTab'
import { PdfToImageTab } from './PdfToImageTab'
import { PdfEncryptTab } from './PdfEncryptTab'
import { PdfDecryptTab } from './PdfDecryptTab'

type Tab = 'image-to-pdf' | 'pdf-to-image' | 'pdf-encrypt' | 'pdf-decrypt'

const TABS: { id: Tab; label: string }[] = [
  { id: 'image-to-pdf', label: '이미지 → PDF' },
  { id: 'pdf-to-image', label: 'PDF → 이미지' },
  { id: 'pdf-encrypt', label: '암호 설정' },
  { id: 'pdf-decrypt', label: '암호 해제' },
]

export function PdfConverter() {
  const [activeTab, setActiveTab] = useState<Tab>('image-to-pdf')

  return (
    <div className="space-y-5">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-[#ffffff15]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-[#a78bfa] text-[#a78bfa]'
                : 'text-[#777] hover:text-[#aaa]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div>
        {activeTab === 'image-to-pdf' && <ImageToPdfTab />}
        {activeTab === 'pdf-to-image' && <PdfToImageTab />}
        {activeTab === 'pdf-encrypt' && <PdfEncryptTab />}
        {activeTab === 'pdf-decrypt' && <PdfDecryptTab />}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 전체 테스트**

```bash
pnpm test
```

Expected: 모든 테스트 통과

- [ ] **Step 4: 커밋**

```bash
git add src/widgets/pdf-converter/ui/PdfConverter.tsx
git commit -m "feat: PDF 암호 설정/해제 탭 추가"
```

---

## 검증

브라우저에서 `http://localhost:3000/tools/pdf-converter` 접속 후:

1. **암호 설정 탭**
   - PDF 업로드 → 유저 비밀번호 입력 → "암호 설정 · 다운로드" 클릭
   - 다운로드된 `_encrypted.pdf`를 PDF 뷰어에서 열면 비밀번호 요구 확인

2. **암호 해제 탭**
   - 위에서 만든 암호화 PDF 업로드 → 비밀번호 입력 → "암호 해제 · 다운로드" 클릭
   - 다운로드된 `_decrypted.pdf`가 비밀번호 없이 열리는 것 확인

3. **에러 케이스**
   - 암호 해제 탭에서 잘못된 비밀번호 입력 시 에러 메시지 표시 확인
   - 유저 비밀번호 미입력 시 다운로드 버튼 비활성화 확인
