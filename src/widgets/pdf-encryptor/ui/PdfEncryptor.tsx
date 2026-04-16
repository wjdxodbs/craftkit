"use client";
import { useState } from "react";
import { PdfEncryptTab } from "./PdfEncryptTab";
import { PdfDecryptTab } from "./PdfDecryptTab";
import { TabNav } from "@/shared/ui/TabNav";

type Tab = "pdf-encrypt" | "pdf-decrypt";

const TABS: { id: Tab; label: string }[] = [
  { id: "pdf-encrypt", label: "암호 설정" },
  { id: "pdf-decrypt", label: "암호 해제" },
];

export function PdfEncryptor() {
  const [activeTab, setActiveTab] = useState<Tab>("pdf-encrypt");

  return (
    <div className="space-y-5">
      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div>
        {activeTab === "pdf-encrypt" && <PdfEncryptTab />}
        {activeTab === "pdf-decrypt" && <PdfDecryptTab />}
      </div>
    </div>
  );
}
