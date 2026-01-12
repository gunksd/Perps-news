'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ExportPreviewModal from './ExportPreviewModal'
import { PDFExportService } from '@/lib/services/pdfExportService'

interface ExportButtonProps {
  locale: string
}

export default function ExportButton({ locale }: ExportButtonProps) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [previewData, setPreviewData] = useState<{
    content: string
    format: 'markdown' | 'txt' | 'json'
    blob?: Blob
    filename?: string
  } | null>(null)

  const fetchExportData = async (format: 'markdown' | 'txt' | 'json') => {
    const response = await fetch(`/api/export?format=${format}&locale=${locale}`)
    if (!response.ok) {
      throw new Error('Export failed')
    }

    const contentDisposition = response.headers.get('Content-Disposition')
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
    const filename = filenameMatch ? filenameMatch[1] : `report-${Date.now()}.${format}`

    const blob = await response.blob()
    const content = await blob.text()

    return { content, blob, filename }
  }

  const handleExport = async (format: 'markdown' | 'txt' | 'json' | 'pdf') => {
    setIsExporting(true)
    setIsOpen(false)

    try {
      if (format === 'pdf') {
        // PDF导出 - 支持中文字符
        const response = await fetch(`/api/export?format=json&locale=${locale}`)
        if (!response.ok) throw new Error('Export failed')

        const jsonData = await response.json()
        const pdfBlob = await PDFExportService.generatePDF(jsonData.news, locale)

        const url = window.URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `financial-news-report-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // 其他格式 - 显示预览
        const data = await fetchExportData(format)
        setPreviewData({ content: data.content, format, blob: data.blob, filename: data.filename })
      }
    } catch (error) {
      console.error('Export error:', error)
      alert(locale === 'zh' ? '导出失败，请重试' : 'Export failed, please try again')
    } finally {
      setIsExporting(false)
    }
  }

  const handleConfirmDownload = () => {
    if (!previewData?.blob || !previewData?.filename) return

    const url = window.URL.createObjectURL(previewData.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = previewData.filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    setPreviewData(null)
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isExporting}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {locale === 'zh' ? '导出' : 'Export'}
            </>
          )}
        </button>

        {isOpen && !isExporting && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <div className="py-1">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>PDF (.pdf)</span>
                </button>

                <button
                  onClick={() => handleExport('markdown')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Markdown (.md)</span>
                </button>

                <button
                  onClick={() => handleExport('txt')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{locale === 'zh' ? '纯文本 (.txt)' : 'Plain Text (.txt)'}</span>
                </button>

                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>JSON (.json)</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 预览模态框 */}
      {previewData && (
        <ExportPreviewModal
          content={previewData.content}
          format={previewData.format}
          locale={locale}
          onClose={() => setPreviewData(null)}
          onConfirm={handleConfirmDownload}
        />
      )}
    </>
  )
}
