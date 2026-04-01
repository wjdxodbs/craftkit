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
    <div className="mx-auto max-w-lg space-y-4">
      {/* 입력 + color swatch */}
      <div className="space-y-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="#3b82f6"
            className={`flex-1 rounded-lg border bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none ${
              !isValid && input.trim() !== ''
                ? 'border-red-500/60 focus:border-red-400'
                : 'border-white/10 focus:border-white/20'
            }`}
          />
          <button
            type="button"
            onClick={() => colorPickerRef.current?.click()}
            className="h-10 w-10 shrink-0 rounded-lg border border-white/10 transition-transform hover:scale-105"
            style={{ background: swatchColor }}
            title="클릭해서 색상 선택"
          />
          <input
            ref={colorPickerRef}
            type="color"
            value={result?.hex ?? '#a78bfa'}
            onChange={handlePickerChange}
            className="sr-only"
          />
        </div>
        <p className="text-xs text-white/30">#hex · rgb() · hsl() · oklch() 형식 지원</p>
      </div>

      {/* 변환 결과 */}
      <div className={`space-y-2 transition-opacity ${result ? 'opacity-100' : 'opacity-30'}`}>
        {FORMAT_LABELS.map((label) => {
          const value = result ? getResultValue(result, label) : '—'
          const isCopied = copied === label
          return (
            <div
              key={label}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <span className="w-14 text-xs font-medium text-white/40">{label}</span>
              <span className="flex-1 font-mono text-sm text-slate-200">{value}</span>
              <button
                type="button"
                onClick={() => result && handleCopy(value, label)}
                disabled={!result}
                className="shrink-0 rounded px-2 py-1 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
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
