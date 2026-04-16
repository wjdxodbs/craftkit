"use client";
import { useState, useEffect, useRef } from "react";
import { convertImagesToPdf } from "@/features/image-to-pdf/lib/convertImagesToPdf";

export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export function useImageToPdf() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsRef = useRef<ImageItem[]>([]);
  itemsRef.current = items;

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const addFiles = (files: File[]) => {
    const newItems: ImageItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setItems((prev) => [...prev, ...newItems]);
    setError(null);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const reorder = (newItems: ImageItem[]) => {
    setItems(newItems);
  };

  const convert = async (): Promise<void> => {
    if (items.length === 0) return;
    setIsConverting(true);
    setError(null);
    try {
      const blob = await convertImagesToPdf(items.map((i) => i.file));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("PDF 변환에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsConverting(false);
    }
  };

  return { items, isConverting, error, addFiles, removeItem, reorder, convert };
}
