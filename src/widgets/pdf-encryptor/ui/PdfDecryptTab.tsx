'use client'
import { useRef } from 'react'
import { motion } from 'motion/react'
import { usePdfDecrypt } from './usePdfDecrypt'
import { ImageUpload } from '@/features/image-upload/ui/ImageUpload'
import { labelCls } from '@/shared/ui/styles'

const inputCls =
  'w-full rounded-[10px] border border-[#ffffff15] bg-[#131313] px-3 py-2 text-sm text-white placeholder-[#555] outline-none transition-colors focus:border-[#a78bfa40]'

export function PdfDecryptTab() {
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const {
    fileName,
    password,
    isProcessing,
    isEncrypted,
    error,
    handleFile,
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
          onClick={() => replaceInputRef.current?.click()}
          className="text-xs text-[#a78bfa] hover:text-[#c9b0ff]"
        >
          파일 교체
        </button>
        <input
          ref={replaceInputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </div>

      {isEncrypted === false ? (
        /* 암호 없음 안내 */
        <div className="rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4 text-sm text-[#aaa]">
          이 PDF는 암호가 설정되어 있지 않습니다.
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
