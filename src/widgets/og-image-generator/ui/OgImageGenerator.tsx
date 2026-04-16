"use client";
import { useState, useEffect, useRef } from "react";
import { ImageUpload } from "@/features/image-upload/ui/ImageUpload";
import { generateOgImage } from "@/features/og-image-export/lib/generateOgImage";
import { renderOgImageToCanvas } from "@/features/og-image-export/lib/renderOgImageToCanvas";
import type {
  OgImageConfig,
  FontFamily,
  TemplateName,
} from "@/features/og-image-export/lib/renderOgImageToCanvas";
import { TemplateTabs } from "./TemplateTabs";
import { segBtn } from "@/shared/ui/styles";
import { DownloadButton } from "@/shared/ui/DownloadButton";

const PRESET_COLORS = ["#0f172a", "#18181b", "#1e1b4b", "#ffffff"];
const GRADIENT_COLORS = ["#0f172a", "#6366f1", "#ec4899", "#f97316"];
const FONTS: FontFamily[] = ["Inter", "Serif", "Mono"];

const labelCls = "mb-2 block text-[11px] font-medium text-[#888]";
const inputCls =
  "h-9 w-full rounded-[10px] border border-[#ffffff15] bg-[#0a0a0a] px-3 text-[13px] text-[#ddd] placeholder:text-[#666] outline-none transition-colors focus-visible:border-[#a78bfa55] focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0c0c0c]";
const swatchCls = (active: boolean) =>
  `size-11 cursor-pointer rounded-[8px] transition-transform hover:scale-110 ${
    active ? "ring-2 ring-[#a78bfa] ring-offset-2 ring-offset-[#0c0c0c]" : ""
  }`;

export function OgImageGenerator() {
  const [config, setConfig] = useState<OgImageConfig>({
    template: "classic",
    backgroundColor: "#0f172a",
    title: "My Awesome Project",
    subtitle: "A short description of your project",
    fontFamily: "Inter",
    gradientColor2: "#ec4899",
    gradientAngle: 135,
    codeTheme: "dark",
  });
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderOgImageToCanvas(canvasRef.current, { ...config, logoDataUrl });
    }
  }, [config, logoDataUrl]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const blob = await generateOgImage({ ...config, logoDataUrl });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "og-image.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("다운로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTemplateChange = (template: TemplateName) => {
    setConfig((c) => ({ ...c, template }));
  };

  const showFont = config.template !== "code-snippet";

  return (
    <div className="space-y-5">
      {/* 템플릿 */}
      <TemplateTabs
        value={config.template ?? "classic"}
        onChange={handleTemplateChange}
      />

      {/* 미리보기 */}
      <div
        className="overflow-hidden rounded-[14px] border border-[#ffffff15] bg-[#0a0a0a]"
        style={{ aspectRatio: "1200/630" }}
      >
        <canvas
          ref={canvasRef}
          width={1200}
          height={630}
          className="h-full w-full"
        />
      </div>

      {/* 다운로드 */}
      <DownloadButton
        onClick={handleDownload}
        disabled={isDownloading}
        isProcessing={isDownloading}
        processingText="생성 중…"
      >
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
        Download PNG
      </DownloadButton>
      {downloadError && (
        <p className="text-center text-[12px] text-red-400">{downloadError}</p>
      )}

      {/* 컨트롤 */}
      <div className="rounded-[14px] border border-[#ffffff15] bg-[#0c0c0c] p-5">
        <div
          className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${
            config.template === "gradient" ? "lg:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          {/* 제목 */}
          <div>
            <label htmlFor="og-title" className={labelCls}>
              제목
            </label>
            <input
              id="og-title"
              value={config.title}
              onChange={(e) =>
                setConfig((c) => ({ ...c, title: e.target.value }))
              }
              className={inputCls}
              placeholder="제목을 입력해주세요…"
            />
          </div>

          {/* 부제목 */}
          <div>
            <label htmlFor="og-subtitle" className={labelCls}>
              부제목
            </label>
            <input
              id="og-subtitle"
              value={config.subtitle}
              onChange={(e) =>
                setConfig((c) => ({ ...c, subtitle: e.target.value }))
              }
              className={inputCls}
              placeholder="부제목 입력…"
            />
          </div>

          {/* 배경색 — classic 전용 */}
          {config.template === "classic" && (
            <div>
              <label className={labelCls}>배경색</label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setConfig((c) => ({ ...c, backgroundColor: color }))
                    }
                    className={swatchCls(config.backgroundColor === color)}
                    style={{ background: color, border: "1px solid #ffffff15" }}
                    aria-label={color}
                  />
                ))}
                <label
                  className="relative size-11 cursor-pointer"
                  title="커스텀 색상"
                >
                  <input
                    type="color"
                    value={
                      config.backgroundColor.startsWith("#")
                        ? config.backgroundColor
                        : "#0f172a"
                    }
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        backgroundColor: e.target.value,
                      }))
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  {PRESET_COLORS.includes(config.backgroundColor) ? (
                    <span className="flex size-11 items-center justify-center rounded-[8px] border border-dashed border-[#ffffff25] text-[11px] text-[#888]">
                      +
                    </span>
                  ) : (
                    <span
                      className="block size-11 rounded-[8px] ring-2 ring-[#a78bfa] ring-offset-2 ring-offset-[#0c0c0c]"
                      style={{
                        background: config.backgroundColor,
                        border: "1px solid #ffffff15",
                      }}
                    />
                  )}
                </label>
              </div>
            </div>
          )}

          {/* 폰트 — classic, gradient 전용 */}
          {showFont && (
            <div>
              <label className={labelCls}>폰트</label>
              <div className="flex gap-2">
                {FONTS.map((font) => (
                  <button
                    key={font}
                    onClick={() =>
                      setConfig((c) => ({ ...c, fontFamily: font }))
                    }
                    className={segBtn(config.fontFamily === font)}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 첫 번째 색상 — gradient 전용 */}
          {config.template === "gradient" && (
            <div>
              <label className={labelCls}>첫 번째 색상</label>
              <div className="flex flex-wrap items-center gap-2">
                {GRADIENT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setConfig((c) => ({ ...c, backgroundColor: color }))
                    }
                    className={swatchCls(config.backgroundColor === color)}
                    style={{ background: color, border: "1px solid #ffffff15" }}
                    aria-label={`첫 번째 ${color}`}
                  />
                ))}
                <label
                  className="relative size-11 cursor-pointer"
                  title="커스텀 색상"
                >
                  <input
                    type="color"
                    value={
                      config.backgroundColor.startsWith("#")
                        ? config.backgroundColor
                        : "#0f172a"
                    }
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        backgroundColor: e.target.value,
                      }))
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  {GRADIENT_COLORS.includes(config.backgroundColor) ? (
                    <span className="flex size-11 items-center justify-center rounded-[8px] border border-dashed border-[#ffffff25] text-[11px] text-[#888]">
                      +
                    </span>
                  ) : (
                    <span
                      className="block size-11 rounded-[8px] ring-2 ring-[#a78bfa] ring-offset-2 ring-offset-[#0c0c0c]"
                      style={{
                        background: config.backgroundColor,
                        border: "1px solid #ffffff15",
                      }}
                    />
                  )}
                </label>
              </div>
            </div>
          )}

          {/* 두 번째 색상 — gradient 전용 */}
          {config.template === "gradient" && (
            <div>
              <label className={labelCls}>두 번째 색상</label>
              <div className="flex flex-wrap items-center gap-2">
                {GRADIENT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setConfig((c) => ({ ...c, gradientColor2: color }))
                    }
                    className={swatchCls(
                      (config.gradientColor2 ?? "#ec4899") === color,
                    )}
                    style={{ background: color, border: "1px solid #ffffff15" }}
                    aria-label={`두 번째 ${color}`}
                  />
                ))}
                <label
                  className="relative size-11 cursor-pointer"
                  title="커스텀 색상"
                >
                  <input
                    type="color"
                    value={
                      (config.gradientColor2 ?? "#ec4899").startsWith("#")
                        ? (config.gradientColor2 ?? "#ec4899")
                        : "#ec4899"
                    }
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        gradientColor2: e.target.value,
                      }))
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  {GRADIENT_COLORS.includes(config.gradientColor2 ?? "") ? (
                    <span className="flex size-11 items-center justify-center rounded-[8px] border border-dashed border-[#ffffff25] text-[11px] text-[#888]">
                      +
                    </span>
                  ) : (
                    <span
                      className="block size-11 rounded-[8px] ring-2 ring-[#a78bfa] ring-offset-2 ring-offset-[#0c0c0c]"
                      style={{
                        background: config.gradientColor2 ?? "#ec4899",
                        border: "1px solid #ffffff15",
                      }}
                    />
                  )}
                </label>
              </div>
            </div>
          )}

          {/* 각도 — gradient 전용 */}
          {config.template === "gradient" && (
            <div>
              <label className={labelCls}>
                각도: {config.gradientAngle ?? 135}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={config.gradientAngle ?? 135}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    gradientAngle: Number(e.target.value),
                  }))
                }
                className="w-full cursor-pointer accent-[#a78bfa]"
              />
            </div>
          )}

          {/* 테마 — code-snippet 전용 */}
          {config.template === "code-snippet" && (
            <div>
              <label className={labelCls}>테마</label>
              <div className="flex gap-2">
                {(["dark", "light"] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() =>
                      setConfig((c) => ({ ...c, codeTheme: theme }))
                    }
                    className={segBtn(config.codeTheme === theme)}
                  >
                    {theme === "dark" ? "Dark" : "Light"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 로고 */}
      <div>
        <label className={labelCls}>로고 (선택)</label>
        <ImageUpload
          onFileLoad={(_, url) => setLogoDataUrl(url)}
          accept="image/png,image/svg+xml,image/webp"
          hint="PNG, SVG, WebP — 투명 배경 권장"
        />
      </div>
    </div>
  );
}
