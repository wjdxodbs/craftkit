'use client'
import { useState } from 'react'
import { ImageToPdfTab } from './ImageToPdfTab'
import { PdfToImageTab } from './PdfToImageTab'

type Tab = 'image-to-pdf' | 'pdf-to-image'

const TABS: { id: Tab; label: string }[] = [
  { id: 'image-to-pdf', label: '이미지 → PDF' },
  { id: 'pdf-to-image', label: 'PDF → 이미지' },
]

export function PdfConverter() {
  const [activeTab, setActiveTab] = useState<Tab>('image-to-pdf')

  return (
    <div className="space-y-5">
      {/* 탭 네비게이션 */}
      <div role="tablist" className="flex gap-2 border-b border-[#ffffff15]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-[#a78bfa] text-[#a78bfa]'
                : 'text-[#777] hover:text-[#aaa]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div>
        {activeTab === 'image-to-pdf' && <ImageToPdfTab />}
        {activeTab === 'pdf-to-image' && <PdfToImageTab />}
      </div>
    </div>
  )
}
