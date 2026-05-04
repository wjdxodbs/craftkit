"use client";
import { useEffect, useRef } from "react";
import { usePdfSplitter } from "./usePdfSplitter";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { DownloadButton } from "@/shared/ui/DownloadButton";
import { FileReplaceHeader } from "@/shared/ui/FileReplaceHeader";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { PdfPageSelector } from "@/shared/ui/PdfPageSelector";

export function PdfSplitter() {
  const {
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
  } = usePdfSplitter();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const renderThumbnailRef = useRef(renderThumbnail);

  useEffect(() => {
    renderThumbnailRef.current = renderThumbnail;
  });

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = Number(
              (entry.target as HTMLElement).dataset.pageNumber,
            );
            if (pageNumber) {
              renderThumbnailRef.current(pageNumber);
              observerRef.current?.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin: "100px" },
    );

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="space-y-5">
      {pages.length === 0 ? (
        <div className="flex flex-col gap-4">
          <ImageUpload
            accept="application/pdf"
            hint="암호화되지 않은 PDF만 지원"
            size="lg"
            onFiles={(files) => {
              if (files[0]) handleFile(files[0]);
            }}
          />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <FileReplaceHeader
            fileName={fileName ?? ""}
            suffix={`(${pages.length}페이지)`}
            accept="application/pdf"
            onFile={handleFile}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <PdfPageSelector
            pages={pages}
            selectedPages={selectedPages}
            onToggle={togglePage}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            onObserveButton={(el) => {
              if (el) observerRef.current?.observe(el);
            }}
          />

          {/* 다운로드 버튼 */}
          <DownloadButton
            onClick={split}
            disabled={selectedPages.size === 0 || isSplitting}
            isProcessing={isSplitting}
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            페이지 추출 · 다운로드 ({selectedPages.size})
          </DownloadButton>
        </div>
      )}
    </div>
  );
}
