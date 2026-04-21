"use client";
import { useState } from "react";
import {
  addWatermarkToPdf,
  type WatermarkOptions,
} from "@/features/pdf-watermark/lib/addWatermarkToPdf";
import { renderPdfPageToDataUrl } from "@/features/pdf-to-image/lib/convertPdfToImages";
import { downloadBlob } from "@/shared/lib/downloadBlob";
import { buildOutputName } from "@/shared/lib/fileName";

export function usePdfWatermark() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);

  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(36);
  const [opacity, setOpacity] = useState(0.3);
  const [color, setColor] = useState("#808080");
  const [mode, setMode] = useState<"tile" | "single">("tile");
  const [position, setPosition] =
    useState<WatermarkOptions["position"]>("center");
  const [spacing, setSpacing] = useState(1.0);

  const handleFile = async (file: File): Promise<void> => {
    try {
      const data = await file.arrayBuffer();
      setPdfData(data);
      setFileName(file.name);
      setError(null);
      setPreviewUrl(null);

      setIsRenderingPreview(true);
      try {
        const url = await renderPdfPageToDataUrl(data, 1, 0.7);
        setPreviewUrl(url);
      } catch {
        // 미리보기 실패는 조용히 무시
      } finally {
        setIsRenderingPreview(false);
      }
    } catch {
      setError("파일을 읽는 데 실패했습니다.");
    }
  };

  const apply = async (): Promise<void> => {
    if (!pdfData || !text.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await addWatermarkToPdf(pdfData, {
        text: text.trim(),
        fontSize,
        opacity,
        color,
        mode,
        position,
        spacing,
      });
      const buffer = result.buffer.slice(
        result.byteOffset,
        result.byteOffset + result.byteLength,
      ) as ArrayBuffer;
      const blob = new Blob([buffer], { type: "application/pdf" });
      downloadBlob(blob, buildOutputName(fileName, "watermarked", "pdf"));
    } catch (err) {
      if (err instanceof Error && err.message === "폰트 로드 실패") {
        setError(
          "폰트를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.",
        );
      } else {
        setError(
          "워터마크 추가에 실패했습니다. PDF가 손상되었거나 암호화되어 있을 수 있습니다.",
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    fileName,
    isProcessing,
    error,
    previewUrl,
    isRenderingPreview,
    text,
    setText,
    fontSize,
    setFontSize,
    opacity,
    setOpacity,
    color,
    setColor,
    mode,
    setMode,
    position,
    setPosition,
    spacing,
    setSpacing,
    handleFile,
    apply,
  };
}
