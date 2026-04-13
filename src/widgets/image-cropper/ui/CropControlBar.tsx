'use client'
import type { OutputFormat } from '@/features/image-crop/lib/cropImage'

const ASPECT_PRESETS: { label: string; value: number | null }[] = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
]

const OUTPUT_FORMATS: { label: string; value: OutputFormat }[] = [
  { label: 'PNG', value: 'image/png' },
  { label: 'JPG', value: 'image/jpeg' },
  { label: 'WebP', value: 'image/webp' },
]

const labelCls = 'text-[11px] font-medium text-[#777]'

const segBtn = (active: boolean) =>
  `cursor-pointer rounded-[10px] px-3 py-1.5 text-xs font-medium transition-colors ${
    active
      ? 'border border-[#a78bfa40] bg-[#a78bfa10] text-[#a78bfa]'
      : 'border border-[#ffffff15] text-[#777] hover:border-[#ffffff25] hover:text-[#bbb]'
  }`

interface CropControlBarProps {
  fileName: string | null
  isDragging: boolean
  aspectRatio: number | null
  outputFormat: OutputFormat
  onFileReplace: () => void
  onFileDrop: (file: File) => void
  onDragOver: () => void
  onDragLeave: () => void
  onPresetChange: (ratio: number | null) => void
  onFormatChange: (format: OutputFormat) => void
}

export function CropControlBar({
  fileName,
  isDragging,
  aspectRatio,
  outputFormat,
  onFileReplace,
  onFileDrop,
  onDragOver,
  onDragLeave,
  onPresetChange,
  onFormatChange,
}: CropControlBarProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      {/* 파일 교체 */}
      <button
        onClick={onFileReplace}
        onDragOver={(e) => { e.preventDefault(); onDragOver() }}
        onDragLeave={onDragLeave}
        onDrop={(e) => {
          e.preventDefault()
          onDragLeave()
          const file = e.dataTransfer.files[0]
          if (file) onFileDrop(file)
        }}
        className={`flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-dashed px-3 py-1.5 text-xs font-medium transition-colors ${
          isDragging
            ? 'border-[#a78bfa] bg-[#a78bfa10] text-[#a78bfa]'
            : 'border-[#a78bfa40] text-[#a78bfa] hover:border-[#a78bfa60] hover:bg-[#a78bfa08]'
        }`}
      >
        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="max-w-[160px] truncate">{fileName ?? '파일 교체'}</span>
      </button>

      <div className="hidden h-4 w-px bg-[#ffffff15] sm:block" />

      {/* 비율 */}
      <div className="flex items-center gap-2">
        <span className={labelCls}>비율</span>
        <div className="flex gap-1.5">
          {ASPECT_PRESETS.map(({ label, value }) => (
            <button
              type="button"
              key={label}
              onClick={() => onPresetChange(value)}
              className={segBtn(aspectRatio === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden h-4 w-px bg-[#ffffff15] sm:block" />

      {/* 출력 포맷 */}
      <div className="flex items-center gap-2">
        <span className={labelCls}>포맷</span>
        <div className="flex gap-1.5">
          {OUTPUT_FORMATS.map(({ label, value }) => (
            <button
              type="button"
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
  )
}
