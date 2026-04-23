"use client";
import { usePdfEncrypt } from "./usePdfEncrypt";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { labelCls } from "@/shared/ui/styles";
import { DownloadButton } from "@/shared/ui/DownloadButton";
import { FileReplaceHeader } from "@/shared/ui/FileReplaceHeader";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Alert, AlertDescription } from "@/shared/ui/alert";

export function PdfEncryptTab() {
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
      <FileReplaceHeader
        fileName={fileName}
        accept="application/pdf"
        onFile={handleFile}
      />

      {/* 비밀번호 입력 */}
      <div className="space-y-3 rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
        <div className="space-y-2">
          <Label htmlFor="user-password" className={labelCls}>
            유저 비밀번호 (필수)
          </Label>
          <Input
            id="user-password"
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            placeholder="PDF를 열 때 필요한 비밀번호"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="owner-password" className={labelCls}>
            소유자 비밀번호 (선택)
          </Label>
          <Input
            id="owner-password"
            type="password"
            value={ownerPassword}
            onChange={(e) => setOwnerPassword(e.target.value)}
            placeholder="미입력 시 유저 비밀번호와 동일"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
