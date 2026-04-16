"use client";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export function usePageSelection(): {
  selectedPages: Set<number>;
  setSelectedPages: Dispatch<SetStateAction<Set<number>>>;
  togglePage: (pageNumber: number) => void;
  selectAll: (pages: { pageNumber: number }[]) => void;
  deselectAll: () => void;
} {
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const togglePage = (pageNumber: number): void => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) next.delete(pageNumber);
      else next.add(pageNumber);
      return next;
    });
  };

  const selectAll = (pages: { pageNumber: number }[]): void => {
    setSelectedPages(new Set(pages.map((p) => p.pageNumber)));
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
