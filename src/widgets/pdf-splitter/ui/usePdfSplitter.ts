"use client";
import { useRef, useState } from "react";
import {
  getPdfPageCount,
  renderPdfPageToDataUrl,
} from "@/features/pdf-to-image/lib/convertPdfToImages";
import { downloadBytes } from "@/shared/lib/zip";
import { sanitizeFilename } from "@/shared/lib/fileName";
import { splitPdf } from "@/features/pdf-split/lib/splitPdf";
import { usePageSelection } from "@/shared/lib/usePageSelection";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface PageItem {
  pageNumber: number;
  thumbnailUrl: string;
  isLoading: boolean;
}

export function usePdfSplitter() {
  const pdfDataRef = useRef<ArrayBuffer | null>(null);
  const renderingSet = useRef<Set<number>>(new Set());
  const [fileName, setFileName] = useState<string | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    selectedPages,
    setSelectedPages,
    togglePage,
    selectAll,
    deselectAll,
  } = usePageSelection(pages);

  const handleFile = async (file: File): Promise<void> => {
    setError(null);
    setPages([]);
    deselectAll();
    setFileName(file.name);
    pdfDataRef.current = null;
    renderingSet.current.clear();

    if (file.size > MAX_FILE_SIZE) {
      setError("파일 크기가 50MB를 초과합니다.");
      return;
    }

    try {
      const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      const isPdf =
        header[0] === 0x25 &&
        header[1] === 0x50 &&
        header[2] === 0x44 &&
        header[3] === 0x46;
      if (!isPdf) {
        setError("유효한 PDF 파일이 아닙니다.");
        return;
      }

      const data = await file.arrayBuffer();
      pdfDataRef.current = data;

      const count = await getPdfPageCount(data);
      setPages(
        Array.from({ length: count }, (_, i) => ({
          pageNumber: i + 1,
          thumbnailUrl: "",
          isLoading: true,
        })),
      );
      setSelectedPages(new Set(Array.from({ length: count }, (_, i) => i + 1)));
    } catch {
      setError(
        "PDF 파일을 불러오지 못했습니다. 암호화된 PDF는 지원하지 않습니다.",
      );
    }
  };

  const renderThumbnail = async (pageNumber: number): Promise<void> => {
    const data = pdfDataRef.current;
    if (!data || renderingSet.current.has(pageNumber)) return;
    renderingSet.current.add(pageNumber);

    try {
      const url = await renderPdfPageToDataUrl(data, pageNumber, 0.3);
      setPages((prev) =>
        prev.map((p) =>
          p.pageNumber === pageNumber
            ? { ...p, thumbnailUrl: url, isLoading: false }
            : p,
        ),
      );
    } catch {
      setPages((prev) =>
        prev.map((p) =>
          p.pageNumber === pageNumber ? { ...p, isLoading: false } : p,
        ),
      );
    }
  };

  const split = async (): Promise<void> => {
    const data = pdfDataRef.current;
    if (!data || selectedPages.size === 0) return;
    setIsSplitting(true);
    setError(null);

    try {
      const sorted = [...selectedPages].sort((a, b) => a - b);
      const result = await splitPdf(data, sorted);
      const rawName = fileName?.replace(/\.pdf$/i, "") ?? "document";
      const safeName = sanitizeFilename(rawName);
      downloadBytes(`${safeName}-split.pdf`, result, "application/pdf");
    } catch {
      setError("PDF 추출에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSplitting(false);
    }
  };

  return {
    fileName,
    pages,
    selectedPages,
    isSplitting,
    error,
    handleFile,
    renderThumbnail,
    togglePage,
    selectAll,
    deselectAll,
    split,
  };
}
