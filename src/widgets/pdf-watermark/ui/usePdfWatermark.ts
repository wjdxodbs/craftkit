"use client";
import { useState } from "react";
import {
  addWatermarkToPdf,
  type WatermarkPosition,
} from "@/features/pdf-watermark/lib/addWatermarkToPdf";
import { renderPdfPageToDataUrl } from "@/features/pdf-to-image/lib/convertPdfToImages";
import { downloadBlob } from "@/shared/lib/downloadBlob";
import { buildOutputName } from "@/shared/lib/fileName";

export type WatermarkType = "text" | "image";

export function usePdfWatermark() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);

  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");

  // 텍스트 워터마크
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState("#808080");

  // 이미지 워터마크
  const [imageBytes, setImageBytes] = useState<ArrayBuffer | null>(null);
  const [imageMimeType, setImageMimeType] = useState<
    "image/png" | "image/jpeg" | null
  >(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState(200);

  // 공통 옵션
  const [opacity, setOpacity] = useState(0.3);
  const [mode, setMode] = useState<"tile" | "single">("tile");
  const [position, setPosition] = useState<WatermarkPosition>("center");
  const [spacing, setSpacing] = useState(1.0);
  const [rotation, setRotation] = useState(-45);

  const setImage = async (file: File): Promise<void> => {
    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      setError("PNG 또는 JPG 이미지만 지원합니다");
      return;
    }
    try {
      const bytes = await file.arrayBuffer();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      setImageBytes(bytes);
      setImageMimeType(file.type);
      setImageDataUrl(dataUrl);
      setError(null);
    } catch {
      setError("이미지를 불러오지 못했습니다");
    }
  };

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
    if (!pdfData) return;
    if (watermarkType === "text" && !text.trim()) return;
    if (watermarkType === "image" && (!imageBytes || !imageMimeType)) return;

    setIsProcessing(true);
    setError(null);
    try {
      const result =
        watermarkType === "image" && imageBytes && imageMimeType
          ? await addWatermarkToPdf(pdfData, {
              type: "image",
              imageBytes,
              imageMimeType,
              imageWidth,
              opacity,
              position,
            })
          : await addWatermarkToPdf(pdfData, {
              type: "text",
              text: text.trim(),
              fontSize,
              opacity,
              color,
              mode,
              position,
              spacing,
              rotation,
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
    watermarkType,
    setWatermarkType,
    text,
    setText,
    fontSize,
    setFontSize,
    color,
    setColor,
    imageDataUrl,
    imageWidth,
    setImageWidth,
    setImage,
    hasImage: imageBytes !== null,
    opacity,
    setOpacity,
    mode,
    setMode,
    position,
    setPosition,
    spacing,
    setSpacing,
    rotation,
    setRotation,
    handleFile,
    apply,
  };
}
