"use client";
import { useRef, useState } from "react";

interface FileReplaceDropzoneProps {
  fileName: string | null;
  accept: string;
  onFile: (file: File) => void;
}

export function FileReplaceDropzone({
  fileName,
  accept,
  onFile,
}: FileReplaceDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) onFile(file);
        }}
        className={`flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-dashed px-3 py-1.5 text-xs font-medium transition-colors ${
          isDragging
            ? "border-[#a78bfa] bg-[#a78bfa10] text-[#a78bfa]"
            : "border-[#a78bfa40] text-[#a78bfa] hover:border-[#a78bfa60] hover:bg-[#a78bfa08]"
        }`}
      >
        <svg
          className="size-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <span className="max-w-[160px] truncate">
          {fileName ?? "파일 교체"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </>
  );
}
