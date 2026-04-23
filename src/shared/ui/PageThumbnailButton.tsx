interface PageThumbnailButtonProps {
  pageNumber: number;
  thumbnailUrl: string;
  isLoading: boolean;
  isSelected: boolean;
  onToggle: () => void;
  /**
   * IntersectionObserver 같은 lazy 로딩 연결용.
   * 렌더된 button element가 콜백으로 전달된다.
   */
  buttonRef?: (el: HTMLButtonElement | null) => void;
}

export function PageThumbnailButton({
  pageNumber,
  thumbnailUrl,
  isLoading,
  isSelected,
  onToggle,
  buttonRef,
}: PageThumbnailButtonProps) {
  return (
    <button
      type="button"
      ref={buttonRef}
      data-page-number={pageNumber}
      onClick={onToggle}
      aria-label={`페이지 ${pageNumber}${isSelected ? " 선택됨" : ""}`}
      aria-pressed={isSelected}
      className={`relative overflow-hidden rounded-lg border-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa] ${
        isSelected
          ? "border-[#a78bfa] bg-[#a78bfa10]"
          : "border-[#ffffff15] bg-[#0c0c0c] hover:border-[#ffffff25]"
      }`}
    >
      {isLoading ? (
        <div
          className="aspect-[210/297] animate-shimmer"
          aria-label={`페이지 ${pageNumber} 로드 중`}
        />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={`페이지 ${pageNumber}`}
            className="aspect-[210/297] w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-[#00000040]">
            <span className="text-xs font-semibold text-[#fff]">
              {pageNumber}
            </span>
          </div>
        </>
      )}
    </button>
  );
}
