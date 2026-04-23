"use client";
import { ImageToPdfTab } from "./ImageToPdfTab";
import { PdfToImageTab } from "./PdfToImageTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";

const tabListCls =
  "h-auto w-full justify-start gap-2 rounded-none border-b border-[#ffffff15] bg-transparent p-0";

const tabTriggerCls =
  "flex-none rounded-none border-transparent px-4 py-3 text-sm font-medium text-[#888] hover:text-[#aaa] data-active:text-[#a78bfa] data-active:shadow-none [&[data-active]]:after:bottom-[-1px] [&[data-active]]:after:h-[2px] [&[data-active]]:after:bg-[#a78bfa] [&[data-active]]:after:opacity-100 dark:data-active:border-transparent dark:data-active:bg-transparent dark:data-active:text-[#a78bfa]";

export function PdfConverter() {
  return (
    <Tabs defaultValue="image-to-pdf" className="space-y-5">
      <TabsList variant="line" className={tabListCls}>
        <TabsTrigger value="image-to-pdf" className={tabTriggerCls}>
          이미지 → PDF
        </TabsTrigger>
        <TabsTrigger value="pdf-to-image" className={tabTriggerCls}>
          PDF → 이미지
        </TabsTrigger>
      </TabsList>

      <TabsContent value="image-to-pdf">
        <ImageToPdfTab />
      </TabsContent>
      <TabsContent value="pdf-to-image">
        <PdfToImageTab />
      </TabsContent>
    </Tabs>
  );
}
