import {
  OUTPUT_FORMATS,
  type OutputFormat,
} from "@/shared/config/image-formats";
import { labelCls, segBtn } from "@/shared/ui/styles";

const numInputCls =
  "w-20 rounded-[10px] border border-[#ffffff15] bg-[#0a0a0a] px-2.5 py-1.5 text-center text-sm text-[#ddd] placeholder:text-[#666] outline-none transition-colors focus:border-[#a78bfa55] disabled:opacity-30";

interface ResizeControlBarProps {
  fileName: string | null;
  isDragging: boolean;
  width: number;
  height: number;
  locked: boolean;
  outputFormat: OutputFormat;
  quality: number;
  onFileReplace: () => void;
  onFileDrop: (file: File) => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onWidthChange: (val: number) => void;
  onHeightChange: (val: number) => void;
  onLockToggle: () => void;
  onFormatChange: (format: OutputFormat) => void;
  onQualityChange: (quality: number) => void;
}

export function ResizeControlBar({
  fileName,
  isDragging,
  width,
  height,
  locked,
  outputFormat,
  quality,
  onFileReplace,
  onFileDrop,
  onDragOver,
  onDragLeave,
  onWidthChange,
  onHeightChange,
  onLockToggle,
  onFormatChange,
  onQualityChange,
}: ResizeControlBarProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* 파일 교체 */}
        <button
          onClick={onFileReplace}
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver();
          }}
          onDragLeave={onDragLeave}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) onFileDrop(file);
          }}
          className={`flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-dashed px-3 py-1.5 text-xs font-medium transition-colors ${
            isDragging
              ? "border-[#a78bfa] bg-[#a78bfa10] text-[#a78bfa]"
              : "border-[#a78bfa40] text-[#a78bfa] hover:border-[#a78bfa60] hover:bg-[#a78bfa08]"
          }`}
        >
          <svg
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <span className="max-w-[160px] truncate">
            {fileName ?? "파일 교체"}
          </span>
        </button>

        <div className="hidden h-4 w-px bg-[#ffffff15] sm:block" />

        {/* 크기 */}
        <div className="flex items-center gap-2">
          <span className={labelCls}>크기</span>
          <input
            type="number"
            min={1}
            max={8192}
            value={width || ""}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            className={numInputCls}
            placeholder="W"
            aria-label="너비 (px)"
          />
          <button
            onClick={onLockToggle}
            className={`flex shrink-0 cursor-pointer items-center justify-center rounded-[10px] border min-h-[44px] min-w-[44px] transition-colors ${
              locked
                ? "border-[#a78bfa40] bg-[#a78bfa10] text-[#a78bfa]"
                : "border-[#ffffff15] text-[#888] hover:border-[#ffffff25] hover:text-[#bbb]"
            }`}
            title={locked ? "비율 잠금 켜짐" : "비율 잠금 꺼짐"}
            aria-label={locked ? "비율 잠금 켜짐" : "비율 잠금 꺼짐"}
          >
            {locked ? (
              <svg
                className="size-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            ) : (
              <svg
                className="size-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            )}
          </button>
          <input
            type="number"
            min={1}
            max={8192}
            value={height || ""}
            onChange={(e) => onHeightChange(Number(e.target.value))}
            className={numInputCls}
            placeholder="H"
            aria-label="높이 (px)"
          />
        </div>

        <div className="hidden h-4 w-px bg-[#ffffff15] sm:block" />

        {/* 출력 포맷 */}
        <div className="flex items-center gap-2">
          <span className={labelCls}>포맷</span>
          <div className="flex gap-1.5">
            {OUTPUT_FORMATS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => onFormatChange(value)}
                className={segBtn(outputFormat === value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 품질 슬라이더 */}
      {outputFormat !== "image/png" && (
        <div className="flex items-center gap-3">
          <span className={`shrink-0 ${labelCls}`}>품질 {quality}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={quality}
            onChange={(e) => onQualityChange(Number(e.target.value))}
            className="flex-1 cursor-pointer accent-[#a78bfa]"
          />
        </div>
      )}
    </>
  );
}
