import type { ReactNode } from "react";
import { ToolHeader } from "@/shared/ui/ToolHeader";
import { TOOLS } from "@/shared/config/tools";

interface ToolPageLayoutProps {
  toolId: string;
  children: ReactNode;
  /**
   * 모바일에서 dvh 전체 높이로 확장한다 (Signature Maker 등).
   */
  fullHeight?: boolean;
}

export function ToolPageLayout({
  toolId,
  children,
  fullHeight,
}: ToolPageLayoutProps) {
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool) return null;

  const containerCls = fullHeight
    ? "mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col px-6 pb-4 pt-6 sm:block sm:min-h-0 sm:px-10 sm:py-10 md:px-16"
    : "mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 md:px-16";

  return (
    <div className={containerCls}>
      <ToolHeader
        name={tool.name}
        description={tool.description}
        accentColor={tool.accentColor}
      />
      {children}
    </div>
  );
}
