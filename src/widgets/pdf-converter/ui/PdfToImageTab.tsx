"use client";
import { usePdfToImage } from "./usePdfToImage";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import {
  OUTPUT_FORMATS,
  type OutputFormat,
} from "@/shared/config/image-formats";
import { labelCls } from "@/shared/ui/styles";
import { DownloadButton } from "@/shared/ui/DownloadButton";
import { FileReplaceHeader } from "@/shared/ui/FileReplaceHeader";
import { Button } from "@/shared/ui/button";
import { Slider } from "@/shared/ui/slider";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { PageThumbnailButton } from "@/shared/ui/PageThumbnailButton";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

export function PdfToImageTab() {
  const {
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
    deselectAll,
    setOutputFormat,
    setQuality,
    convert,
  } = usePdfToImage();

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
          <div className="space-y-3">
            <FileReplaceHeader
              fileName={fileName ?? ""}
              suffix={`(${pages.length}페이지)`}
              accept="application/pdf"
              onFile={handleFile}
            />

            {/* 페이지 선택 컨트롤 */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="segment"
                size="seg"
                onClick={selectAll}
              >
                전체 선택
              </Button>
              <Button
                type="button"
                variant="segment"
                size="seg"
                onClick={deselectAll}
              >
                전체 해제
              </Button>
              <span className="text-xs text-[#888]">
                {selectedPages.size} / {pages.length} 선택됨
              </span>
            </div>
          </div>

          {/* 포맷 및 품질 설정 */}
          <div className="space-y-3 rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-4">
            <div className="space-y-2">
              <p className={labelCls}>출력 포맷</p>
              <ToggleGroup
                value={[outputFormat]}
                onValueChange={(v: string[]) => {
                  const next = v[0] as OutputFormat | undefined;
                  if (next) setOutputFormat(next);
                }}
                spacing={4}
              >
                {OUTPUT_FORMATS.map((f) => (
                  <ToggleGroupItem
                    key={f.value}
                    value={f.value}
                    variant="segment"
                    size="seg"
                  >
                    {f.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {outputFormat !== "image/png" && (
              <div className="space-y-2">
                <p className={labelCls}>품질 {quality}%</p>
                <Slider
                  min={10}
                  max={100}
                  value={[quality]}
                  onValueChange={(v) => setQuality(Array.isArray(v) ? v[0] : v)}
                  aria-label={`품질 ${quality}%`}
                />
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 페이지 썸네일 그리드 */}
          <div className="space-y-2">
            <p className="text-xs text-[#888]">페이지 선택</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {pages.map((page) => (
                <PageThumbnailButton
                  key={page.pageNumber}
                  pageNumber={page.pageNumber}
                  thumbnailUrl={page.thumbnailUrl}
                  isLoading={page.isLoading}
                  isSelected={selectedPages.has(page.pageNumber)}
                  onToggle={() => togglePage(page.pageNumber)}
                />
              ))}
            </div>
          </div>

          <DownloadButton
            onClick={convert}
            disabled={selectedPages.size === 0 || isConverting}
            isProcessing={isConverting}
            processingText="변환 중…"
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
            Download ({selectedPages.size})
          </DownloadButton>
        </div>
      )}
    </div>
  );
}
