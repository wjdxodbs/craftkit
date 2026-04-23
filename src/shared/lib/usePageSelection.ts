"use client";
import { useState, useRef, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

interface PageLike {
  pageNumber: number;
}

/**
 * PDF 페이지 선택 상태를 관리한다.
 * `pages`를 인자로 받으면 `selectAll`이 매 렌더마다 최신 pages를 참조한다.
 */
export function usePageSelection(pages: PageLike[] = []): {
  selectedPages: Set<number>;
  setSelectedPages: Dispatch<SetStateAction<Set<number>>>;
  togglePage: (pageNumber: number) => void;
  selectAll: () => void;
  deselectAll: () => void;
} {
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const pagesRef = useRef(pages);
  useEffect(() => {
    pagesRef.current = pages;
  });

  const togglePage = (pageNumber: number): void => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) next.delete(pageNumber);
      else next.add(pageNumber);
      return next;
    });
  };

  const selectAll = (): void => {
    setSelectedPages(new Set(pagesRef.current.map((p) => p.pageNumber)));
  };

  const deselectAll = (): void => {
    setSelectedPages(new Set());
  };

  return {
    selectedPages,
    setSelectedPages,
    togglePage,
    selectAll,
    deselectAll,
  };
}
