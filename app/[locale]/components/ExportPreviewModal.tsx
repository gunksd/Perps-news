'use client'

import { useState } from 'react'

interface ExportPreviewModalProps {
  content: string
  format: 'markdown' | 'txt' | 'json'
  locale: string
  onClose: () => void
  onConfirm: () => void
}

export default function ExportPreviewModal({
  content,
  format,
  locale,
  onClose,
  onConfirm
}: ExportPreviewModalProps) {
  const getFormatName = () => {
    switch (format) {
      case 'markdown': return 'Markdown'
      case 'txt': return locale === 'zh' ? '纯文本' : 'Plain Text'
      case 'json': return 'JSON'
      default: return format
    }
  }

  const getPreviewContent = () => {
    if (format === 'json') {
      try {
        return JSON.stringify(JSON.parse(content), null, 2)
      } catch {
        return content
      }
    }
    return content
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {locale === 'zh' ? '导出预览' : 'Export Preview'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {locale === 'zh' ? '格式：' : 'Format: '}{getFormatName()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800 leading-relaxed">
            {getPreviewContent()}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-b-xl">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {locale === 'zh'
              ? `文件大小: ${(new Blob([content]).size / 1024).toFixed(2)} KB`
              : `File Size: ${(new Blob([content]).size / 1024).toFixed(2)} KB`}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
            >
              {locale === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-md hover:shadow-lg"
            >
              {locale === 'zh' ? '确认下载' : 'Confirm Download'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
