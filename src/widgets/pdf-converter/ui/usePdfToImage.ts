"use client";
import { useState, useRef, useEffect } from "react";
import {
  renderAllThumbnails,
  convertPdfPageToBlob,
} from "@/features/pdf-to-image/lib/convertPdfToImages";
import { createZip, downloadBytes } from "@/shared/lib/zip";
import { downloadBlob } from "@/shared/lib/downloadBlob";
import { EXT_MAP, type OutputFormat } from "@/shared/config/image-formats";
import { usePageSelection } from "@/shared/lib/usePageSelection";

export interface PageItem {
  pageNumber: number;
  thumbnailUrl: string;
  isLoading: boolean;
}

export function usePdfToImage() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(90);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const {
    selectedPages,
    deselectAll,
    togglePage,
    selectAll: _selectAll,
  } = usePageSelection();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const selectAll = (): void => _selectAll(pages);

  const handleFile = async (file: File): Promise<void> => {
    setError(null);
    setPages([]);
    deselectAll();
    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      if (!mountedRef.current) return;
      setPdfData(data);

      await renderAllThumbnails(
        data,
        0.3,
        (count) => {
          if (!mountedRef.current) return;
          setPages(
            Array.from({ length: count }, (_, i) => ({
              pageNumber: i + 1,
              thumbnailUrl: "",
              isLoading: true,
            })),
          );
        },
        (pageNumber, thumbnailUrl) => {
          if (!mountedRef.current) return;
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
      if (mountedRef.current) {
        setError(
          "PDF 파일을 불러오지 못했습니다. 암호화된 PDF는 지원하지 않습니다.",
        );
      }
    }
  };

  const deselectAllPages = (): void => deselectAll();

  const convert = async (): Promise<void> => {
    if (!pdfData || selectedPages.size === 0) return;
    setIsConverting(true);
    setError(null);

    try {
      const sorted = [...selectedPages].sort((a, b) => a - b);
      const blobs = await Promise.all(
        sorted.map((pageNumber) =>
          convertPdfPageToBlob(
            pdfData,
            pageNumber,
            outputFormat,
            quality / 100,
          ),
        ),
      );

      const ext = EXT_MAP[outputFormat];

      if (blobs.length === 1) {
        downloadBlob(blobs[0], `page-${sorted[0]}.${ext}`);
      } else {
        const entries: Record<string, Uint8Array> = {};
        for (let i = 0; i < blobs.length; i++) {
          const buf = await blobs[i].arrayBuffer();
          entries[`page-${sorted[i]}.${ext}`] = new Uint8Array(buf);
        }
        const zip = createZip(entries);
        downloadBytes("pages.zip", zip);
      }
    } catch {
      setError("이미지 변환에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsConverting(false);
    }
  };

  return {
    fileName,
    pages,
    selectedPages,
    outputFormat,
    quality,
    isConverting,
    error,
    handleFile,
    togglePage,
    selectAll,
    deselectAll: deselectAllPages,
    setOutputFormat,
    setQuality,
    convert,
  };
}
