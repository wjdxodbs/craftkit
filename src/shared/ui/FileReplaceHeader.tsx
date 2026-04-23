"use client";
import { useRef } from "react";

interface FileReplaceHeaderProps {
  fileName: string;
  accept: string;
  onFile: (file: File) => void;
  suffix?: string;
}

export function FileReplaceHeader({
  fileName,
  accept,
  onFile,
  suffix,
}: FileReplaceHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-[#fff]">
        {fileName}
        {suffix && <span className="text-[#888]"> {suffix}</span>}
      </h3>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer text-xs text-[#a78bfa] transition-colors hover:text-[#c9b0ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]"
      >
        파일 교체
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
    </div>
  );
}
