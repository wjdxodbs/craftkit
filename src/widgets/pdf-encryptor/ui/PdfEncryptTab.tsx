"use client";
import { useRef } from "react";
import { usePdfEncrypt } from "./usePdfEncrypt";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { labelCls } from "@/shared/ui/styles";
import { DownloadButton } from "@/shared/ui/DownloadButton";

const inputCls =
  "w-full rounded-[10px] border border-[#ffffff15] bg-[#131313] px-3 py-2 text-sm text-white placeholder-[#555] outline-none transition-colors focus:border-[#a78bfa40]";

export function PdfEncryptTab() {
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const {
    fileName,
    userPassword,
    ownerPassword,
    isProcessing,
    error,
    handleFile,
    setUserPassword,
    setOwnerPassword,
    encrypt,
  } = usePdfEncrypt();

  if (!fileName) {
    return (
      <ImageUpload
        accept="application/pdf"
        hint="암호를 설정할 PDF 업로드"
        size="lg"
        onFiles={(files) => {
          if (files[0]) handleFile(files[0]);
        }}
      />
    );
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
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
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
      <DownloadButton
        onClick={encrypt}
        disabled={!userPassword || isProcessing}
        isProcessing={isProcessing}
      >
        암호 설정 · 다운로드
      </DownloadButton>
    </div>
  );
}
