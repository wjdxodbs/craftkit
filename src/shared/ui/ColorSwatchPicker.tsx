"use client";

interface ColorSwatchPickerProps {
  colors: readonly string[];
  value: string;
  onChange: (color: string) => void;
  fallbackCustom?: string;
  ariaPrefix?: string;
}

export function ColorSwatchPicker({
  colors,
  value,
  onChange,
  fallbackCustom = "#0f172a",
  ariaPrefix,
}: ColorSwatchPickerProps) {
  const isPreset = colors.includes(value);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {colors.map((color) => {
        const label = ariaPrefix ? `${ariaPrefix} ${color}` : color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={label}
            className={`size-11 cursor-pointer rounded-[8px] transition-transform hover:scale-110 ${
              value === color
                ? "ring-2 ring-[#a78bfa] ring-offset-2 ring-offset-[#0c0c0c]"
                : ""
            }`}
            style={{ background: color, border: "1px solid #ffffff15" }}
          />
        );
      })}
      <label className="relative size-11 cursor-pointer" title="커스텀 색상">
        <input
          type="color"
          value={value.startsWith("#") ? value : fallbackCustom}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        {isPreset ? (
          <span className="flex size-11 items-center justify-center rounded-[8px] border border-dashed border-[#ffffff25] text-[11px] text-[#888]">
            +
          </span>
        ) : (
          <span
            className="block size-11 rounded-[8px] ring-2 ring-[#a78bfa] ring-offset-2 ring-offset-[#0c0c0c]"
            style={{ background: value, border: "1px solid #ffffff15" }}
          />
        )}
      </label>
    </div>
  );
}
