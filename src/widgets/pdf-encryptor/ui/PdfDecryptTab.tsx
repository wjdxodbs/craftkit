"use client";
import { usePdfDecrypt } from "./usePdfDecrypt";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { labelCls } from "@/shared/ui/styles";
import { DownloadButton } from "@/shared/ui/DownloadButton";
import { FileReplaceHeader } from "@/shared/ui/FileReplaceHeader";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Alert, AlertDescription } from "@/shared/ui/alert";

export function PdfDecryptTab() {
  const {
    fileName,
    password,
    isProcessing,
    isEncrypted,
    error,
    handleFile,
    setPassword,
    decrypt,
  } = usePdfDecrypt();

  if (!fileName) {
    return (
      <ImageUpload
        accept="application/pdf"
        hint="암호를 해제할 PDF 업로드"
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

      {isEncrypted === false ? (
        <Alert>
          <AlertDescription>
            이 PDF는 암호가 설정되어 있지 않습니다.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* 비밀번호 입력 */}
          <div className="space-y-2 rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
            <Label htmlFor="decrypt-password" className={labelCls}>
              비밀번호
            </Label>
            <Input
              id="decrypt-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") decrypt();
              }}
              placeholder="PDF 비밀번호 입력"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DownloadButton
            onClick={decrypt}
            disabled={!password || isProcessing}
            isProcessing={isProcessing}
          >
            암호 해제 · 다운로드
          </DownloadButton>
        </>
      )}
    </div>
  );
}
