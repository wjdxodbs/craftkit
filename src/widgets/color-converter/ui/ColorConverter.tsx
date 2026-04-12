'use client'
import { useState, useRef } from 'react'
import { convertColor } from '@/features/color-convert/lib/convertColor'
import type { ColorResult } from '@/features/color-convert/lib/convertColor'

const FORMAT_LABELS = ['HEX', 'RGB', 'HSL', 'OKLCH'] as const
type FormatLabel = typeof FORMAT_LABELS[number]

function getResultValue(result: ColorResult, label: FormatLabel): string {
  switch (label) {
    case 'HEX': return result.hex
    case 'RGB': return result.rgb
    case 'HSL': return result.hsl
    case 'OKLCH': return result.oklch
  }
}

const labelCls = 'text-[11px] font-medium text-[#777]'

export function ColorConverter() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ColorResult | null>(null)
  const [isValid, setIsValid] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const colorPickerRef = useRef<HTMLInputElement>(null)

  const handleInput = (value: string) => {
    setInput(value)
    const converted = convertColor(value.trim())
    if (converted) {
      setResult(converted)
      setIsValid(true)
    } else {
      setIsValid(value.trim() === '')
    }
  }

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    setInput(hex)
    const converted = convertColor(hex)
    if (converted) {
      setResult(converted)
      setIsValid(true)
    }
  }

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const swatchColor = result?.hex ?? '#a78bfa'

  return (
    <div className="rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-5">
      {/* 상단: 스와치 + 입력 */}
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <button
          type="button"
          onClick={() => colorPickerRef.current?.click()}
          title="클릭해서 색상 선택"
          className="h-32 w-32 shrink-0 cursor-pointer rounded-[14px] border border-[#ffffff15] transition-transform hover:scale-[1.02]"
          style={{ background: swatchColor }}
        />
        <input
          ref={colorPickerRef}
          type="color"
          value={result?.hex ?? '#a78bfa'}
          onChange={handlePickerChange}
          className="sr-only"
        />

        <div className="flex-1 space-y-2">
          <label className={labelCls}>색상 입력</label>
          <input
            type="text"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="#a78bfa"
            className={`w-full rounded-[10px] border bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#ddd] placeholder:text-[#444] outline-none transition-colors ${
              !isValid && input.trim() !== ''
                ? 'border-red-500/60 focus:border-red-400'
                : 'border-[#ffffff15] focus:border-[#a78bfa55]'
            }`}
          />
          <p className="text-[11px] text-[#555]">#hex · rgb() · hsl() · oklch()</p>
        </div>
      </div>

      {/* 구분선 */}
      <div className="my-5 border-t border-[#ffffff08]" />

      {/* 변환 결과 — 속성 리스트 */}
      <div className={`transition-opacity ${result ? 'opacity-100' : 'opacity-30'}`}>
        {FORMAT_LABELS.map((label) => {
          const value = result ? getResultValue(result, label) : '—'
          const isCopied = copied === label
          return (
            <div
              key={label}
              className="flex items-center gap-3 border-b border-[#ffffff05] py-3 last:border-b-0"
            >
              <span className="w-16 shrink-0 text-[11px] font-semibold tracking-widest text-[#555]">{label}</span>
              <span className="flex-1 truncate font-mono text-sm text-[#ddd]">{value}</span>
              <button
                type="button"
                onClick={() => result && handleCopy(value, label)}
                disabled={!result}
                className="shrink-0 cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium text-[#777] transition-colors hover:bg-[#a78bfa10] hover:text-[#a78bfa] disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isCopied ? '복사됨' : '복사'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
