'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, ChevronDown, Copy, Maximize2, Minimize2, Star, Zap } from 'lucide-react'
import { AIModel } from '@/types/app'
import { useDarkMode } from '@/contexts/DarkModeContext'
import ResponseSummary from './ResponseSummary'
import TextToSpeech from './TextToSpeech'

interface AIResponseCardProps {
  model: AIModel
  content: string
  loading: boolean
  error?: string
  isBestResponse?: boolean
  onMarkBest?: () => void
  responseTime?: number
}

export default function AIResponseCard({
  model,
  content,
  loading,
  error,
  isBestResponse = false,
  onMarkBest,
  responseTime
}: AIResponseCardProps) {
  const { darkMode } = useDarkMode()
  const [copied, setCopied] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const PREVIEW_CHAR_LIMIT = 320
  const LONG_CONTENT_THRESHOLD = 500
  const VERY_LONG_CONTENT_THRESHOLD = 1500

  useEffect(() => {
    const checkScrollNeeded = () => {
      if (!scrollRef.current) return

      const { scrollHeight, clientHeight, scrollTop } = scrollRef.current
      setShowScrollIndicator(scrollHeight > clientHeight)

      if (scrollHeight > clientHeight) {
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
        setReadingProgress(Math.min(progress, 100))
      } else {
        setReadingProgress(100)
      }
    }

    const scrollContainer = scrollRef.current
    if (scrollContainer) scrollContainer.addEventListener('scroll', checkScrollNeeded)

    checkScrollNeeded()
    const timeoutId = setTimeout(checkScrollNeeded, 100)

    return () => {
      if (scrollContainer) scrollContainer.removeEventListener('scroll', checkScrollNeeded)
      clearTimeout(timeoutId)
    }
  }, [content, isExpanded])

  const handleExpand = () => {
    setIsExpanded(!isExpanded)
    setShowPreview(false)
  }

  const isLongContent = content.length > LONG_CONTENT_THRESHOLD
  const isVeryLongContent = content.length > VERY_LONG_CONTENT_THRESHOLD
  const shouldShowPreview = showPreview && isLongContent && !isExpanded
  const displayContent = shouldShowPreview ? `${content.substring(0, PREVIEW_CHAR_LIMIT)}...` : content

  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200
    const words = text.split(' ').length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes === 1 ? '1 min read' : `${minutes} min read`
  }

  const handleCopy = async () => {
    if (!content) return
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getProviderTone = (provider: string) => {
    const colors = {
      Google: 'from-blue-500 to-green-500',
      Anthropic: 'from-orange-500 to-amber-400',
      OpenAI: 'from-emerald-500 to-cyan-500',
      Meta: 'from-blue-600 to-indigo-500',
      DeepSeek: 'from-violet-500 to-fuchsia-500',
      Qwen: 'from-red-500 to-orange-500',
      Grok: 'from-slate-600 to-slate-800',
      Kimi: 'from-cyan-500 to-blue-500',
      Shisa: 'from-pink-500 to-purple-500',
      xAI: 'from-slate-600 to-slate-800',
      Alibaba: 'from-red-500 to-orange-500',
      Perplexity: 'from-violet-500 to-fuchsia-500'
    }

    return colors[provider as keyof typeof colors] || 'from-slate-500 to-slate-700'
  }

  return (
    <div
      className={`relative h-full overflow-hidden rounded-[1.5rem] border ${
        isBestResponse
          ? 'border-amber-400/30 bg-gradient-to-b from-amber-400/10 to-slate-950/60 shadow-[0_24px_60px_rgba(245,158,11,0.10)]'
          : darkMode
            ? 'border-white/8 bg-white/[0.03]'
            : 'border-slate-200/70 bg-white/80'
      }`}
    >
      <div className="flex h-full flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${getProviderTone(model.provider)} text-base font-semibold text-white shadow-lg`}>
              {model.displayName.charAt(0)}
            </div>
            <div>
              <h3 className={`${darkMode ? 'text-white' : 'text-slate-900'} text-lg font-semibold`}>{model.displayName}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                  darkMode ? 'border-white/8 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-600'
                }`}>
                  {model.provider}
                </span>
                {responseTime !== undefined && responseTime > 0 && (
                  <span className="rounded-full border border-cyan-400/10 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-200">
                    {responseTime.toFixed(2)}s
                  </span>
                )}
              </div>
            </div>
          </div>

          {content && !loading && (
            <div className="flex items-center gap-2">
              <button
                onClick={onMarkBest}
                className={`rounded-xl p-2 transition-colors ${
                  isBestResponse
                    ? 'bg-amber-400/15 text-amber-200'
                    : darkMode
                      ? 'bg-white/5 text-slate-400 hover:text-amber-200'
                      : 'bg-slate-100 text-slate-500 hover:text-amber-600'
                }`}
                title={isBestResponse ? 'Best response' : 'Mark as best'}
                aria-label={isBestResponse ? 'Best response' : 'Mark as best'}
              >
                <Star className={`h-4 w-4 ${isBestResponse ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleCopy}
                className={`rounded-xl p-2 transition-colors ${
                  darkMode ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
                title="Copy response"
                aria-label="Copy response"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-950 border-t-cyan-300" />
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
                  <Zap className="h-4 w-4 text-cyan-300" />
                  Thinking...
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/12">
                  <AlertCircle className="h-6 w-6 text-rose-300" />
                </div>
                <p className="mb-2 text-sm font-medium text-rose-200">Something went wrong</p>
                <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>
              </div>
            </div>
          ) : content ? (
            <div className="flex flex-1 flex-col">
              {isLongContent && (
                <div className="mb-3 flex items-center justify-between rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-3 py-2">
                  <div className="text-xs text-cyan-200">Long response | {getReadingTime(content)}</div>
                  <button
                    onClick={handleExpand}
                    className="flex items-center gap-1 text-xs font-medium text-cyan-200"
                  >
                    {isExpanded ? (
                      <>
                        <Minimize2 className="h-3 w-3" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3 w-3" />
                        Expand
                      </>
                    )}
                  </button>
                </div>
              )}

              {isVeryLongContent && !shouldShowPreview && (
                <div className="mb-3">
                  <div className="h-1.5 w-full rounded-full bg-white/8">
                    <div
                      className="reading-indicator h-1.5 rounded-full bg-cyan-300"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Reading progress</span>
                    <span>{Math.round(readingProgress)}%</span>
                  </div>
                </div>
              )}

              <div className="relative flex-1">
                <div
                  ref={scrollRef}
                  className={`response-scroll overflow-y-auto rounded-2xl border p-4 ${
                    darkMode ? 'border-white/8 bg-black/10' : 'border-slate-200 bg-slate-50/80'
                  } ${isExpanded ? 'max-h-96' : isLongContent ? 'max-h-52' : 'max-h-80'}`}
                >
                  <div className={`${darkMode ? 'text-slate-200' : 'text-slate-700'} whitespace-pre-wrap text-sm leading-7`}>
                    {displayContent}
                  </div>

                  {shouldShowPreview && (
                    <div className={`mt-4 pt-4 ${darkMode ? 'border-t border-white/8' : 'border-t border-slate-200'}`}>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="flex items-center gap-2 text-sm font-medium text-cyan-200"
                      >
                        <ChevronDown className="h-4 w-4" />
                        Show full response
                      </button>
                    </div>
                  )}
                </div>

                {showScrollIndicator && !shouldShowPreview && (
                  <div className="absolute bottom-0 left-0 right-0 flex h-10 items-end justify-center rounded-b-2xl bg-gradient-to-t from-slate-950/90 to-transparent pb-2">
                    <div className="rounded-full bg-slate-900/90 px-3 py-1 text-xs text-slate-400">
                      Scroll for more
                    </div>
                  </div>
                )}
              </div>

              <ResponseSummary
                content={content}
                isVisible={showSummary}
                onToggle={() => setShowSummary(!showSummary)}
              />

              <div className="mt-3 space-y-2">
                <TextToSpeech text={content} />

                <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>{content.split(' ').length} words</span>
                    <span>{content.length} characters</span>
                    {isLongContent && <span className="text-cyan-200">{getReadingTime(content)}</span>}
                  </div>
                  {isLongContent && (
                    <span className={`rounded-full px-2.5 py-1 ${darkMode ? 'bg-white/5' : 'bg-slate-100 text-slate-600'}`}>
                      {content.length > 1000 ? 'Very long' : 'Long'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <Star className={`h-8 w-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                </div>
                <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium`}>Ready to respond</p>
                <p className="mt-1 text-xs text-slate-400">Send a message to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
