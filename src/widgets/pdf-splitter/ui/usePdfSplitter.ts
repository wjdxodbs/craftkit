"use client";
import { useState } from "react";
import { renderAllThumbnails } from "@/features/pdf-to-image/lib/convertPdfToImages";
import { downloadBlob } from "@/shared/lib/zip";
import { splitPdf } from "@/features/pdf-split/lib/splitPdf";

export interface PageItem {
  pageNumber: number;
  thumbnailUrl: string;
  isLoading: boolean;
}

export function usePdfSplitter() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isSplitting, setIsSplitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File): Promise<void> => {
    setError(null);
    setPages([]);
    setSelectedPages(new Set());
    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      setPdfData(data);

      await renderAllThumbnails(
        data,
        0.3,
        (count) => {
          setPages(
            Array.from({ length: count }, (_, i) => ({
              pageNumber: i + 1,
              thumbnailUrl: "",
              isLoading: true,
            })),
          );
        },
        (pageNumber, thumbnailUrl) => {
          setPages((prev) =>
            prev.map((p) =>
              p.pageNumber === pageNumber
                ? { ...p, thumbnailUrl, isLoading: false }
                : p,
            ),
          );
        },
      );
    } catch {
      setError(
        "PDF 파일을 불러오지 못했습니다. 암호화된 PDF는 지원하지 않습니다.",
      );
    }
  };

  const togglePage = (pageNumber: number): void => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) next.delete(pageNumber);
      else next.add(pageNumber);
      return next;
    });
  };

  const selectAll = (): void => {
    setSelectedPages(new Set(pages.map((p) => p.pageNumber)));
  };

  const deselectAll = (): void => {
    setSelectedPages(new Set());
  };

  const split = async (): Promise<void> => {
    if (!pdfData || selectedPages.size === 0) return;
    setIsSplitting(true);
    setError(null);

    try {
      const sorted = [...selectedPages].sort((a, b) => a - b);
      const result = await splitPdf(pdfData, sorted);
      const baseName = fileName?.replace(/\.pdf$/i, "") ?? "document";
      downloadBlob(`${baseName}-split.pdf`, result, "application/pdf");
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
    togglePage,
    selectAll,
    deselectAll,
    split,
  };
}
