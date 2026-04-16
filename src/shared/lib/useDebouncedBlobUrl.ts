"use client";
import { useState, useEffect, useRef } from "react";

export function useDebouncedBlobUrl(
  generate: () => Promise<Blob | null>,
  delay = 300,
): { url: string | null; size: number | null } {
  const [url, setUrl] = useState<string | null>(null);
  const [size, setSize] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const blob = await generate();
        if (!blob) {
          setUrl(null);
          setSize(null);
          return;
        }
        const newUrl = URL.createObjectURL(blob);
        latestUrlRef.current = newUrl;
        setUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return newUrl;
        });
        setSize(blob.size);
      } catch {
        setUrl(null);
        setSize(null);
      }
    }, delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [generate, delay]);

  useEffect(() => {
    return () => {
      if (latestUrlRef.current) URL.revokeObjectURL(latestUrlRef.current);
    };
  }, []);

  return { url, size };
}
