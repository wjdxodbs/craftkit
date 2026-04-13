'use client'
import { useState } from 'react'
import { ImageToPdfTab } from './ImageToPdfTab'
import { PdfToImageTab } from './PdfToImageTab'

type Tab = 'image-to-pdf' | 'pdf-to-image'

export function PdfConverter() {
  const [activeTab, setActiveTab] = useState<Tab>('image-to-pdf')

  return (
    <div className="space-y-5">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-[#ffffff15]">
        <button
          onClick={() => setActiveTab('image-to-pdf')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'image-to-pdf'
              ? 'border-b-2 border-[#a78bfa] text-[#a78bfa]'
              : 'text-[#777] hover:text-[#aaa]'
          }`}
        >
          이미지 → PDF
        </button>
        <button
          onClick={() => setActiveTab('pdf-to-image')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'pdf-to-image'
              ? 'border-b-2 border-[#a78bfa] text-[#a78bfa]'
              : 'text-[#777] hover:text-[#aaa]'
          }`}
        >
          PDF → 이미지
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div>
        {activeTab === 'image-to-pdf' && <ImageToPdfTab />}
        {activeTab === 'pdf-to-image' && <PdfToImageTab />}
      </div>
    </div>
  )
}
