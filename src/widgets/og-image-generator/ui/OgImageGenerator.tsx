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
import { labelCls } from "@/shared/ui/styles";
import { DownloadButton } from "@/shared/ui/DownloadButton";
import { ColorSwatchPicker } from "@/shared/ui/ColorSwatchPicker";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { downloadBlob } from "@/shared/lib/downloadBlob";

const PRESET_COLORS = ["#0f172a", "#18181b", "#1e1b4b", "#ffffff"] as const;
const GRADIENT_BASE_COLORS = ["#0f172a", "#1e1b4b", "#134e4a"] as const;
const GRADIENT_ACCENT_COLORS = ["#6366f1", "#ec4899", "#f97316"] as const;
const FONTS: FontFamily[] = ["Inter", "Serif", "Mono"];

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
      downloadBlob(blob, "og-image.png");
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
          <div className="space-y-2">
            <Label htmlFor="og-title" className={labelCls}>
              제목
            </Label>
            <Input
              id="og-title"
              value={config.title}
              onChange={(e) =>
                setConfig((c) => ({ ...c, title: e.target.value }))
              }
              placeholder="제목을 입력해주세요…"
            />
          </div>

          {/* 부제목 */}
          <div className="space-y-2">
            <Label htmlFor="og-subtitle" className={labelCls}>
              부제목
            </Label>
            <Input
              id="og-subtitle"
              value={config.subtitle}
              onChange={(e) =>
                setConfig((c) => ({ ...c, subtitle: e.target.value }))
              }
              placeholder="부제목 입력…"
            />
          </div>

          {/* 배경색 — classic 전용 */}
          {config.template === "classic" && (
            <div className="space-y-2">
              <p className={labelCls}>배경색</p>
              <ColorSwatchPicker
                colors={PRESET_COLORS}
                value={config.backgroundColor}
                onChange={(color) =>
                  setConfig((c) => ({ ...c, backgroundColor: color }))
                }
                fallbackCustom="#0f172a"
              />
            </div>
          )}

          {/* 폰트 — classic, gradient 전용 */}
          {showFont && (
            <div className="space-y-2">
              <p className={labelCls}>폰트</p>
              <ToggleGroup
                value={[config.fontFamily]}
                onValueChange={(v: string[]) => {
                  const next = v[0] as FontFamily | undefined;
                  if (next) setConfig((c) => ({ ...c, fontFamily: next }));
                }}
                spacing={4}
              >
                {FONTS.map((font) => (
                  <ToggleGroupItem
                    key={font}
                    value={font}
                    variant="segment"
                    size="seg"
                  >
                    {font}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          {/* 첫 번째 색상 — gradient 전용 */}
          {config.template === "gradient" && (
            <div className="space-y-2">
              <p className={labelCls}>첫 번째 색상</p>
              <ColorSwatchPicker
                colors={GRADIENT_BASE_COLORS}
                value={config.backgroundColor}
                onChange={(color) =>
                  setConfig((c) => ({ ...c, backgroundColor: color }))
                }
                fallbackCustom="#0f172a"
                ariaPrefix="첫 번째"
              />
            </div>
          )}

          {/* 두 번째 색상 — gradient 전용 */}
          {config.template === "gradient" && (
            <div className="space-y-2">
              <p className={labelCls}>두 번째 색상</p>
              <ColorSwatchPicker
                colors={GRADIENT_ACCENT_COLORS}
                value={config.gradientColor2 ?? "#ec4899"}
                onChange={(color) =>
                  setConfig((c) => ({ ...c, gradientColor2: color }))
                }
                fallbackCustom="#ec4899"
                ariaPrefix="두 번째"
              />
            </div>
          )}

          {/* 각도 — gradient 전용 */}
          {config.template === "gradient" && (
            <div className="space-y-2">
              <p className={labelCls}>각도: {config.gradientAngle ?? 135}°</p>
              <Slider
                min={0}
                max={360}
                value={[config.gradientAngle ?? 135]}
                onValueChange={(v) => {
                  const n = Array.isArray(v) ? v[0] : v;
                  setConfig((c) => ({ ...c, gradientAngle: n }));
                }}
              />
            </div>
          )}

          {/* 테마 — code-snippet 전용 */}
          {config.template === "code-snippet" && (
            <div className="space-y-2">
              <p className={labelCls}>테마</p>
              <ToggleGroup
                value={[config.codeTheme ?? "dark"]}
                onValueChange={(v: string[]) => {
                  const next = v[0];
                  if (next === "dark" || next === "light")
                    setConfig((c) => ({ ...c, codeTheme: next }));
                }}
                spacing={4}
              >
                <ToggleGroupItem value="dark" variant="segment" size="seg">
                  Dark
                </ToggleGroupItem>
                <ToggleGroupItem value="light" variant="segment" size="seg">
                  Light
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
        </div>
      </div>

      {/* 로고 */}
      <div className="space-y-2">
        <p className={labelCls}>로고 (선택)</p>
        <ImageUpload
          onFileLoad={(_, url) => setLogoDataUrl(url)}
          accept="image/png,image/svg+xml,image/webp"
          hint="PNG, SVG, WebP — 투명 배경 권장"
        />
      </div>
    </div>
  );
}
