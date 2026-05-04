"use client";
import { RectangleHorizontal, RectangleVertical } from "lucide-react";
import {
  OUTPUT_FORMATS,
  type OutputFormat,
} from "@/shared/config/image-formats";
import { labelCls } from "@/shared/ui/styles";
import { FileReplaceDropzone } from "@/shared/ui/FileReplaceDropzone";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

export type Orientation = "landscape" | "portrait";

const LANDSCAPE_ASPECTS = [
  { id: "free", label: "Free", ratio: null as number | null },
  { id: "1-1", label: "1:1", ratio: 1 },
  { id: "16-9", label: "16:9", ratio: 16 / 9 },
  { id: "4-3", label: "4:3", ratio: 4 / 3 },
] as const;

const PORTRAIT_ASPECTS = [
  { id: "free", label: "Free", ratio: null as number | null },
  { id: "1-1", label: "1:1", ratio: 1 },
  { id: "9-16", label: "9:16", ratio: 9 / 16 },
  { id: "3-4", label: "3:4", ratio: 3 / 4 },
] as const;

function ratioToId(ratio: number | null, orientation: Orientation): string {
  if (ratio === null) return "free";
  const options =
    orientation === "landscape" ? LANDSCAPE_ASPECTS : PORTRAIT_ASPECTS;
  const found = options.find(
    (o) => o.ratio !== null && Math.abs(o.ratio - ratio) < 0.01,
  );
  return found?.id ?? "free";
}

interface CropControlBarProps {
  fileName: string | null;
  aspectRatio: number | null;
  orientation: Orientation;
  outputFormat: OutputFormat;
  onFileReplace: (file: File) => void;
  onPresetChange: (ratio: number | null) => void;
  onOrientationChange: (orientation: Orientation) => void;
  onFormatChange: (format: OutputFormat) => void;
}

export function CropControlBar({
  fileName,
  aspectRatio,
  orientation,
  outputFormat,
  onFileReplace,
  onPresetChange,
  onOrientationChange,
  onFormatChange,
}: CropControlBarProps) {
  const aspects =
    orientation === "landscape" ? LANDSCAPE_ASPECTS : PORTRAIT_ASPECTS;
  const activeAspectId = ratioToId(aspectRatio, orientation);

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
          value={[orientation]}
          onValueChange={(v: string[]) => {
            const next = v[0];
            if (next === "landscape" || next === "portrait")
              onOrientationChange(next);
          }}
          spacing={4}
        >
          <ToggleGroupItem
            value="landscape"
            variant="segment"
            size="seg"
            aria-label="가로 비율"
          >
            <RectangleHorizontal className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="portrait"
            variant="segment"
            size="seg"
            aria-label="세로 비율"
          >
            <RectangleVertical className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          value={[activeAspectId]}
          onValueChange={(v: string[]) => {
            const id = v[0];
            if (!id) return;
            const opt = aspects.find((o) => o.id === id);
            if (opt) onPresetChange(opt.ratio);
          }}
          spacing={4}
        >
          {aspects.map(({ id, label }) => (
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
