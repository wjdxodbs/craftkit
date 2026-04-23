import {
  OUTPUT_FORMATS,
  type OutputFormat,
} from "@/shared/config/image-formats";
import { labelCls } from "@/shared/ui/styles";
import { Input } from "@/shared/ui/input";
import { Slider } from "@/shared/ui/slider";
import { FileReplaceDropzone } from "@/shared/ui/FileReplaceDropzone";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

interface ResizeControlBarProps {
  fileName: string | null;
  width: number;
  height: number;
  locked: boolean;
  outputFormat: OutputFormat;
  quality: number;
  onFileReplace: (file: File) => void;
  onWidthChange: (val: number) => void;
  onHeightChange: (val: number) => void;
  onLockToggle: () => void;
  onFormatChange: (format: OutputFormat) => void;
  onQualityChange: (quality: number) => void;
}

export function ResizeControlBar({
  fileName,
  width,
  height,
  locked,
  outputFormat,
  quality,
  onFileReplace,
  onWidthChange,
  onHeightChange,
  onLockToggle,
  onFormatChange,
  onQualityChange,
}: ResizeControlBarProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <FileReplaceDropzone
          fileName={fileName}
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
          onFile={onFileReplace}
        />

        <div className="hidden h-4 w-px bg-[#ffffff15] sm:block" />

        {/* 크기 — 연결된 쌍 + 중앙 잠금 배지 */}
        <div className="flex items-center gap-2">
          <span className={labelCls}>크기</span>
          <div className="relative flex items-center">
            <Input
              type="number"
              min={1}
              max={8192}
              value={width || ""}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              placeholder="W"
              aria-label="너비 (px)"
              className="w-24 rounded-r-none border-r-0 pr-6 text-center"
            />
            <button
              type="button"
              onClick={onLockToggle}
              aria-pressed={locked}
              title={locked ? "비율 잠금 켜짐" : "비율 잠금 꺼짐"}
              aria-label={locked ? "비율 잠금 켜짐" : "비율 잠금 꺼짐"}
              className={`absolute left-1/2 top-1/2 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border transition-colors after:absolute after:inset-[-6px] after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa] ${
                locked
                  ? "border-[#a78bfa] bg-[#0c0c0c] text-[#a78bfa] hover:bg-[#a78bfa10]"
                  : "border-[#3a3a3a] bg-[#0c0c0c] text-[#888] hover:border-[#555] hover:text-[#bbb]"
              }`}
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
            <Input
              type="number"
              min={1}
              max={8192}
              value={height || ""}
              onChange={(e) => onHeightChange(Number(e.target.value))}
              placeholder="H"
              aria-label="높이 (px)"
              className="w-24 rounded-l-none border-l-0 pl-6 text-center"
            />
          </div>
        </div>

        <div className="hidden h-4 w-px bg-[#ffffff15] sm:block" />

        {/* 출력 포맷 */}
        <div className="flex items-center gap-2">
          <span className={labelCls}>포맷</span>
          <ToggleGroup
            value={[outputFormat]}
            onValueChange={(v: string[]) => {
              const next = v[0] as OutputFormat | undefined;
              if (next) onFormatChange(next);
            }}
            spacing={4}
          >
            {OUTPUT_FORMATS.map(({ label, value }) => (
              <ToggleGroupItem
                key={value}
                value={value}
                variant="segment"
                size="seg"
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {/* 품질 슬라이더 */}
      {outputFormat !== "image/png" && (
        <div className="flex items-center gap-3">
          <span className={`shrink-0 ${labelCls}`}>품질 {quality}%</span>
          <Slider
            min={0}
            max={100}
            value={[quality]}
            onValueChange={(v) => onQualityChange(Array.isArray(v) ? v[0] : v)}
            aria-label={`품질 ${quality}%`}
            className="flex-1"
          />
        </div>
      )}
    </>
  );
}
