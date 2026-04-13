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
