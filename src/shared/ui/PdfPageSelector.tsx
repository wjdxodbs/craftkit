"use client";
import { Button } from "@/shared/ui/button";
import { PageThumbnailButton } from "@/shared/ui/PageThumbnailButton";

interface Page {
  pageNumber: number;
  thumbnailUrl: string;
  isLoading: boolean;
}

interface PdfPageSelectorProps {
  pages: Page[];
  selectedPages: Set<number>;
  onToggle: (pageNumber: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  /**
   * IntersectionObserver 같은 lazy 로딩 연결용 콜백.
   * 각 썸네일 버튼 element가 전달된다.
   */
  onObserveButton?: (el: HTMLButtonElement | null) => void;
}

export function PdfPageSelector({
  pages,
  selectedPages,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onObserveButton,
}: PdfPageSelectorProps) {
  return (
    <div className="space-y-3">
      {/* 선택 컨트롤 */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="segment"
          size="seg"
          onClick={onSelectAll}
        >
          전체 선택
        </Button>
        <Button
          type="button"
          variant="segment"
          size="seg"
          onClick={onDeselectAll}
        >
          전체 해제
        </Button>
        <span className="text-xs text-[#888]">
          {selectedPages.size} / {pages.length} 선택됨
        </span>
      </div>

      {/* 썸네일 그리드 */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {pages.map((page) => (
          <PageThumbnailButton
            key={page.pageNumber}
            pageNumber={page.pageNumber}
            thumbnailUrl={page.thumbnailUrl}
            isLoading={page.isLoading}
            isSelected={selectedPages.has(page.pageNumber)}
            onToggle={() => onToggle(page.pageNumber)}
            buttonRef={onObserveButton}
          />
        ))}
      </div>
    </div>
  );
}
