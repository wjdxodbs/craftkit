"use client";
import { useState } from "react";
import {
  decryptPdf,
  isPdfEncrypted,
} from "@/features/pdf-encrypt/lib/encryptPdf";

export function usePdfDecrypt() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEncrypted, setIsEncrypted] = useState<boolean | null>(null);

  const handleFile = async (file: File): Promise<void> => {
    try {
      const data = await file.arrayBuffer();
      const encrypted = await isPdfEncrypted(data);
      setPdfData(data);
      setFileName(file.name);
      setIsEncrypted(encrypted);
      setPassword("");
      setError(null);
    } catch {
      setError("파일을 읽는 데 실패했습니다.");
    }
  };

  const reset = (): void => {
    setPdfData(null);
    setFileName(null);
    setPassword("");
    setIsEncrypted(null);
    setError(null);
  };

  const decrypt = async (): Promise<void> => {
    if (!pdfData || !password) return;
    setIsProcessing(true);
    setError(null);
    try {
      const decrypted = await decryptPdf(pdfData, password);
      const blob = new Blob([decrypted.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const rawName = fileName
        ? fileName.replace(/\.pdf$/i, "_decrypted.pdf")
        : "decrypted.pdf";
      a.download = rawName.replace(/[/\\?%*:|"<>\x00]/g, "_");
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("비밀번호가 올바르지 않거나 암호화된 PDF가 아닙니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    fileName,
    password,
    isProcessing,
    isEncrypted,
    error,
    handleFile,
    reset,
    setPassword,
    decrypt,
  };
}
