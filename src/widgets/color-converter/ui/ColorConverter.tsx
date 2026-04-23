"use client";
import { useState, useRef } from "react";
import { convertColor } from "@/features/color-convert/lib/convertColor";
import type { ColorResult } from "@/features/color-convert/lib/convertColor";
import { labelCls } from "@/shared/ui/styles";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";

const FORMAT_LABELS = ["HEX", "RGB", "HSL", "OKLCH"] as const;
type FormatLabel = (typeof FORMAT_LABELS)[number];

function getResultValue(result: ColorResult, label: FormatLabel): string {
  switch (label) {
    case "HEX":
      return result.hex;
    case "RGB":
      return result.rgb;
    case "HSL":
      return result.hsl;
    case "OKLCH":
      return result.oklch;
  }
}

export function ColorConverter() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ColorResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValid = input.trim() === "" || !!convertColor(input.trim());

  const handleInput = (value: string) => {
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const converted = convertColor(value.trim());
      if (converted) {
        setResult(converted);
      }
    }, 300);
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setInput(hex);
    const converted = convertColor(hex);
    if (converted) {
      setResult(converted);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const swatchColor = result?.hex ?? "#a78bfa";
  const hasError = !isValid && input.trim() !== "";

  return (
    <div className="rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-5">
      {/* 상단: 스와치 + 입력 */}
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <button
          type="button"
          onClick={() => colorPickerRef.current?.click()}
          title="클릭해서 색상 선택"
          aria-label="클릭해서 색상 선택"
          className="h-32 w-32 shrink-0 cursor-pointer rounded-[14px] border border-[#ffffff15] transition-transform hover:scale-[1.02]"
          style={{ background: swatchColor }}
        />
        <input
          ref={colorPickerRef}
          type="color"
          value={result?.hex ?? "#a78bfa"}
          onChange={handlePickerChange}
          className="sr-only"
        />

        <div className="flex-1 space-y-2">
          <Label htmlFor="color-input" className={labelCls}>
            색상 입력
          </Label>
          <Input
            id="color-input"
            type="text"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="#a78bfa"
            aria-invalid={hasError || undefined}
          />
          <p className="text-[11px] text-[#888]">
            #hex · rgb() · hsl() · oklch()
          </p>
        </div>
      </div>

      {/* 구분선 */}
      <div className="my-5 border-t border-[#ffffff08]" />

      {/* 변환 결과 — 속성 리스트 */}
      <div
        className={`transition-opacity ${result ? "opacity-100" : "opacity-30"}`}
      >
        {FORMAT_LABELS.map((label) => {
          const value = result ? getResultValue(result, label) : "—";
          const isCopied = copied === label;
          return (
            <div
              key={label}
              className="flex items-center gap-3 border-b border-[#ffffff05] py-3 last:border-b-0"
            >
              <span className="w-16 shrink-0 text-[11px] font-semibold tracking-widest text-[#888]">
                {label}
              </span>
              <span className="flex-1 truncate font-mono text-sm text-[#ddd]">
                {value}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => result && handleCopy(value, label)}
                disabled={!result}
                className="text-[11px] text-[#888] hover:bg-[#a78bfa10] hover:text-[#a78bfa] disabled:opacity-30"
              >
                {isCopied ? "복사됨" : "복사"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
