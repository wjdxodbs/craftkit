"use client";
import { useState } from "react";
import { ImageToPdfTab } from "./ImageToPdfTab";
import { PdfToImageTab } from "./PdfToImageTab";
import { TabNav } from "@/shared/ui/TabNav";

type Tab = "image-to-pdf" | "pdf-to-image";

const TABS: { id: Tab; label: string }[] = [
  { id: "image-to-pdf", label: "이미지 → PDF" },
  { id: "pdf-to-image", label: "PDF → 이미지" },
];

export function PdfConverter() {
  const [activeTab, setActiveTab] = useState<Tab>("image-to-pdf");

  return (
    <div className="space-y-5">
      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div>
        {activeTab === "image-to-pdf" && <ImageToPdfTab />}
        {activeTab === "pdf-to-image" && <PdfToImageTab />}
      </div>
    </div>
  );
}
