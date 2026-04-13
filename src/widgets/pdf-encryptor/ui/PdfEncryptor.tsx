'use client'
import { useState } from 'react'
import { PdfEncryptTab } from './PdfEncryptTab'
import { PdfDecryptTab } from './PdfDecryptTab'

type Tab = 'pdf-encrypt' | 'pdf-decrypt'

const TABS: { id: Tab; label: string }[] = [
  { id: 'pdf-encrypt', label: '암호 설정' },
  { id: 'pdf-decrypt', label: '암호 해제' },
]

export function PdfEncryptor() {
  const [activeTab, setActiveTab] = useState<Tab>('pdf-encrypt')

  return (
    <div className="space-y-5">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-[#ffffff15]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
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
        {activeTab === 'pdf-encrypt' && <PdfEncryptTab />}
        {activeTab === 'pdf-decrypt' && <PdfDecryptTab />}
      </div>
    </div>
  )
}
