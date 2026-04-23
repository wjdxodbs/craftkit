"use client";
import {
  OUTPUT_FORMATS,
  type OutputFormat,
} from "@/shared/config/image-formats";
import { labelCls } from "@/shared/ui/styles";
import { FileReplaceDropzone } from "@/shared/ui/FileReplaceDropzone";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

const ASPECT_OPTIONS = [
  { id: "free", label: "Free", ratio: null as number | null },
  { id: "1-1", label: "1:1", ratio: 1 },
  { id: "16-9", label: "16:9", ratio: 16 / 9 },
  { id: "4-3", label: "4:3", ratio: 4 / 3 },
] as const;

function ratioToId(ratio: number | null): string {
  if (ratio === null) return "free";
  const found = ASPECT_OPTIONS.find(
    (o) => o.ratio !== null && Math.abs(o.ratio - ratio) < 0.01,
  );
  return found?.id ?? "free";
}

interface CropControlBarProps {
  fileName: string | null;
  aspectRatio: number | null;
  outputFormat: OutputFormat;
  onFileReplace: (file: File) => void;
  onPresetChange: (ratio: number | null) => void;
  onFormatChange: (format: OutputFormat) => void;
}

export function CropControlBar({
  fileName,
  aspectRatio,
  outputFormat,
  onFileReplace,
  onPresetChange,
  onFormatChange,
}: CropControlBarProps) {
  const activeAspectId = ratioToId(aspectRatio);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <FileReplaceDropzone
        fileName={fileName}
        accept="image/png,image/jpeg,image/webp"
        onFile={onFileReplace}
      />

      <div className="hidden h-4 w-px bg-[#ffffff15] sm:block" />

      {/* 비율 */}
      <div className="flex items-center gap-2">
        <span className={labelCls}>비율</span>
        <ToggleGroup
          value={[activeAspectId]}
          onValueChange={(v: string[]) => {
            const id = v[0];
            if (!id) return;
            const opt = ASPECT_OPTIONS.find((o) => o.id === id);
            if (opt) onPresetChange(opt.ratio);
          }}
          spacing={4}
        >
          {ASPECT_OPTIONS.map(({ id, label }) => (
            <ToggleGroupItem key={id} value={id} variant="segment" size="seg">
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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
  );
}
