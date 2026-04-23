"use client";
import { PdfEncryptTab } from "./PdfEncryptTab";
import { PdfDecryptTab } from "./PdfDecryptTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";

const tabListCls =
  "h-auto w-full justify-start gap-2 rounded-none border-b border-[#ffffff15] bg-transparent p-0";

const tabTriggerCls =
  "flex-none rounded-none border-transparent px-4 py-3 text-sm font-medium text-[#888] hover:text-[#aaa] data-active:text-[#a78bfa] data-active:shadow-none [&[data-active]]:after:bottom-[-1px] [&[data-active]]:after:h-[2px] [&[data-active]]:after:bg-[#a78bfa] [&[data-active]]:after:opacity-100 dark:data-active:border-transparent dark:data-active:bg-transparent dark:data-active:text-[#a78bfa]";

export function PdfEncryptor() {
  return (
    <Tabs defaultValue="pdf-encrypt" className="space-y-5">
      <TabsList variant="line" className={tabListCls}>
        <TabsTrigger value="pdf-encrypt" className={tabTriggerCls}>
          암호 설정
        </TabsTrigger>
        <TabsTrigger value="pdf-decrypt" className={tabTriggerCls}>
          암호 해제
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pdf-encrypt">
        <PdfEncryptTab />
      </TabsContent>
      <TabsContent value="pdf-decrypt">
        <PdfDecryptTab />
      </TabsContent>
    </Tabs>
  );
}
