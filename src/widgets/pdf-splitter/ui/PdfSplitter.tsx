"use client";
import { useRef } from "react";
import { motion } from "motion/react";
import { usePdfSplitter } from "./usePdfSplitter";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { segBtn } from "@/shared/ui/styles";

export function PdfSplitter() {
  const {
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
  } = usePdfSplitter();

  const replaceInputRef = useRef<HTMLInputElement>(null);

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
            <div className="rounded-[14px] border border-[#ef444415] bg-[#ef44440a] p-3 text-xs text-[#ff6b6b]">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 파일 정보 */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#fff]">
              {fileName} ({pages.length}페이지)
            </h3>
            <button
              type="button"
              onClick={() => replaceInputRef.current?.click()}
              className="text-xs text-[#a78bfa] hover:text-[#c9b0ff]"
            >
              파일 교체
            </button>
            <input
              ref={replaceInputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </div>

          {/* 선택 컨트롤 */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={selectAll} className={segBtn(false)}>
              전체 선택
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className={segBtn(false)}
            >
              전체 해제
            </button>
            <span className="text-xs text-[#777]">
              {selectedPages.size} / {pages.length} 선택됨
            </span>
          </div>

          {/* 에러 */}
          {error && (
            <div className="rounded-[14px] border border-[#ef444415] bg-[#ef44440a] p-3 text-xs text-[#ff6b6b]">
              {error}
            </div>
          )}

          {/* 썸네일 그리드 */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {pages.map((page) => (
              <button
                key={page.pageNumber}
                type="button"
                onClick={() => togglePage(page.pageNumber)}
                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  selectedPages.has(page.pageNumber)
                    ? "border-[#a78bfa] bg-[#a78bfa10]"
                    : "border-[#ffffff15] bg-[#0c0c0c] hover:border-[#ffffff25]"
                }`}
              >
                {page.isLoading ? (
                  <div className="aspect-[210/297] animate-pulse bg-[#ffffff08]" />
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={page.thumbnailUrl}
                      alt={`페이지 ${page.pageNumber}`}
                      className="aspect-[210/297] w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-[#00000040]">
                      <span className="text-xs font-semibold text-[#fff]">
                        {page.pageNumber}
                      </span>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* 다운로드 버튼 */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <button
              onClick={split}
              disabled={selectedPages.size === 0 || isSplitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#a78bfa40] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#a78bfa] transition-all hover:border-[#a78bfa60] hover:bg-[#a78bfa10] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSplitting ? (
                "처리 중…"
              ) : (
                <>
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
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
