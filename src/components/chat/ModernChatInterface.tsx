'use client'

import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { BarChart3, Clock, MessageSquare, Plus, Send, Settings, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { AVAILABLE_MODELS } from '@/lib/models'
import { AIModel } from '@/types/app'
import { ChatSession } from '@/types/chat'
import AIResponseCard from './AIResponseCard'
import ModelSelector from './ModelSelector'
import BlankComparisonPage from './BlankComparisonPage'
import { useAuth } from '@/contexts/AuthContext'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { chatHistoryService } from '@/services/chatHistory.service'
import ProfileDropdown from '@/components/layout/ProfileDropdown'
import AIFiestaLogo from '@/components/landing/AIFiestaLogo'

interface ModernChatInterfaceProps {
  initialConversation?: ChatSession | null
}

export default function ModernChatInterface({ initialConversation }: ModernChatInterfaceProps) {
  const { user } = useAuth()
  const { darkMode } = useDarkMode()
  const [message, setMessage] = useState('')
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState<string[]>([])
  const [selectedModels, setSelectedModels] = useState<string[]>(
    AVAILABLE_MODELS.slice(0, 2).map(model => model.id)
  )
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showBlankPage, setShowBlankPage] = useState(false)
  const [isTextareaOverflowing, setIsTextareaOverflowing] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const suggestedPrompts = [
    'Compare GPT-4o, Claude 3.5, and Llama 3.1 on code review.',
    'Which model writes better SQL from a natural language spec?',
    'Summarize this article and extract 5 action items.',
    'Generate test cases for this API and estimate coverage.'
  ]

  useEffect(() => {
    const loadChatSessions = async () => {
      if (initialConversation) {
        setChatSessions([initialConversation])
        setCurrentSessionId(initialConversation.id)
        return
      }

      const apiSessions = await chatHistoryService.getChatSessions()
      if (apiSessions && apiSessions.length > 0) {
        const sessionsWithDates: ChatSession[] = apiSessions.map((session) => ({
          ...session,
          timestamp: session.timestamp instanceof Date ? session.timestamp : new Date(session.timestamp),
          selectedModels: session.selectedModels || []
        }))
        setChatSessions(sessionsWithDates)

        if (!currentSessionId) {
          const mostRecentSession = sessionsWithDates.reduce((latest, session) =>
            new Date(session.timestamp) > new Date(latest.timestamp) ? session : latest,
            sessionsWithDates[0]
          )
          setCurrentSessionId(mostRecentSession.id)
        }
        return
      }

      localStorage.removeItem('aiFiestaChatSessions')
    }

    loadChatSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversation])

  useEffect(() => {
    const saveChatSessions = async () => {
      if (chatSessions.length > 0) {
        const mostRecentSession = chatSessions.reduce((latest, session) =>
          new Date(session.timestamp) > new Date(latest.timestamp) ? session : latest,
          chatSessions[0]
        )

        if (mostRecentSession.responses && mostRecentSession.responses.length > 0) {
          const saveResult = await chatHistoryService.saveChatSession(mostRecentSession)
          if (!saveResult) {
            console.warn('Failed to save to database, data will only be available locally')
          }
        }

      }
    }

    saveChatSessions()
  }, [chatSessions])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 120)
      textareaRef.current.style.height = `${nextHeight}px`
      setIsTextareaOverflowing(textareaRef.current.scrollHeight > 120)
    }
  }, [message])

  useEffect(() => {
    const pendingMessage = localStorage.getItem('pendingMessage')
    const pendingModelsStr = localStorage.getItem('pendingModels')

    if (pendingModelsStr) {
      try {
        const pendingModels = JSON.parse(pendingModelsStr)
        if (Array.isArray(pendingModels) && pendingModels.length > 0) {
          setSelectedModels(pendingModels)
          localStorage.removeItem('pendingModels')
        }
      } catch (e) {
        console.error('Failed to parse pending models', e)
      }
    }

    if (pendingMessage && pendingMessage.trim()) {
      setMessage(pendingMessage)
      localStorage.removeItem('pendingMessage')

      const submitTimer = setTimeout(() => {
        const modelsToUse = pendingModelsStr ? JSON.parse(pendingModelsStr) : selectedModels

        if (modelsToUse.length > 0) {
          const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
          handleSubmit(syntheticEvent)
        }
      }, 800)

      return () => clearTimeout(submitTimer)
    }
    // We intentionally hydrate any pending landing-page prompt only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNewChat = () => {
    setShowBlankPage(true)
    setMessage('')
  }

  const startNewComparison = (prompt?: string) => {
    setChatSessions([])
    setCurrentSessionId(null)
    localStorage.removeItem('aiFiestaChatSessions')
    setShowBlankPage(false)
    
    if (typeof prompt === 'string') {
      setMessage(prompt)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => {
      const isSelected = prev.includes(modelId)
      if (isSelected) return prev.filter(id => id !== modelId)
      if (prev.length >= 3) return prev
      return [...prev, modelId]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || selectedModels.length === 0) return

    const currentMsg = message.trim()
    setLoading(selectedModels)

    const newSessionId = Date.now().toString()
    const newSession: ChatSession = {
      id: newSessionId,
      message: currentMsg,
      responses: [],
      timestamp: new Date(),
      selectedModels: [...selectedModels]
    }

    setChatSessions(prev => [...prev, newSession])
    setCurrentSessionId(newSessionId)
    setMessage('')

    try {
      const startTime = Date.now()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMsg, models: selectedModels })
      })

      const endTime = Date.now()
      const responseTime = (endTime - startTime) / 1000

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('Please sign in to use AI comparisons.')
        }
        if (response.status === 429) {
          throw new Error(errorData.error || 'Rate limit exceeded. Please wait and try again.')
        }
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()

      setChatSessions(prev => prev.map(session =>
        session.id === newSessionId
          ? { ...session, responses: data.results, responseTime: data.responseTime || responseTime }
          : session
      ))

      chatHistoryService.updateCacheWithNewSession({
        ...newSession,
        responses: data.results,
        responseTime: data.responseTime || responseTime
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error sending message:', errorMessage)

      const errorResponses = selectedModels.map(model => ({
        model,
        content: '',
        error: `Failed to send message: ${errorMessage}`,
        success: false
      }))

      setChatSessions(prev => prev.map(session =>
        session.id === newSessionId ? { ...session, responses: errorResponses } : session
      ))
    } finally {
      setLoading([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  const handleMarkBest = (modelId: string) => {
    if (!currentSessionId) return

    setChatSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          bestResponse: session.bestResponse === modelId ? undefined : modelId
        }
      }
      return session
    }))
  }

  const getModelById = (modelId: string) => AVAILABLE_MODELS.find(model => model.id === modelId)

  const highlightModelsInText = (text: string): React.ReactNode => {
    const modelNames = AVAILABLE_MODELS.map(m => m.label)
    const pattern = new RegExp(`\\b(${modelNames.map(n => n.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi')
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = pattern.exec(text)) !== null) {
      const matchText = match[0]
      const start = match.index
      const end = start + matchText.length

      if (start > lastIndex) parts.push(text.slice(lastIndex, start))
      parts.push(
        <span key={`${start}-${end}`} className="rounded-md bg-cyan-400/10 px-1.5 py-0.5 text-cyan-200">
          {matchText}
        </span>
      )
      lastIndex = end
    }

    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts
  }

  return (
    <div className="flex h-screen bg-transparent text-white">
      <aside className="fiesta-panel m-4 hidden w-72 rounded-[1.75rem] lg:flex lg:flex-col">
        <div className="flex h-full flex-col justify-between p-5">
          <div>
            <div className="mb-6 border-b border-white/8 pb-5">
              <div className="mb-6 flex items-center gap-3">
                <AIFiestaLogo size="md" darkMode={darkMode} />
                <div>
                  <h1 className="text-xl font-semibold text-white">AI Fiesta</h1>
                </div>
              </div>

              <button
                onClick={handleNewChat}
                className="fiesta-button-primary flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-sm font-semibold"
                title="Start New Comparison"
              >
                <Plus className="h-5 w-5" />
                New Comparison
              </button>
            </div>

            <nav className="space-y-2">
              <Link href="/chat" className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 text-sm font-medium text-white">
                <MessageSquare className="h-5 w-5" />
                Current Chat
              </Link>
              <Link href="/history" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white">
                <Clock className="h-5 w-5" />
                History
              </Link>
              <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white">
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="border-t border-white/8 pt-4">
            <ProfileDropdown />
          </div>
        </div>
      </aside>

      <main className="m-4 flex min-w-0 flex-1 flex-col">
        <div className="fiesta-panel mb-4 rounded-[1.75rem] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
                {selectedModels.length} {selectedModels.length === 1 ? 'model' : 'models'} selected
              </div>
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="fiesta-button-secondary flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium"
                title="Configure AI Models"
              >
                <Settings className="h-4 w-4" />
                Configure Models
              </button>
            </div>
          </div>

          {showModelSelector && (
            <div className="fiesta-panel-soft mt-4 rounded-2xl p-4">
              <ModelSelector selectedModels={selectedModels} onModelToggle={handleModelToggle} />
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {showBlankPage ? (
            <BlankComparisonPage onStartNew={startNewComparison} />
          ) : chatSessions.length > 0 ? (
            <div className="h-full overflow-y-auto pr-1">
              <div className="space-y-6">
                {chatSessions.map((session) => (
                  <section key={session.id} className="fiesta-panel rounded-[1.75rem]">
                    <div className="border-b border-white/8 px-6 py-5">
                      <div className="mx-auto max-w-4xl">
                        <div className="flex items-start gap-4">
                          {user?.user_metadata?.avatar_url ? (
                            <img
                              src={user.user_metadata.avatar_url}
                              alt="Profile"
                              className="h-10 w-10 rounded-2xl object-cover ring-1 ring-cyan-400/30"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-semibold text-white">
                              {(user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'User')).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              {user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'User')}
                            </p>
                            <p className="mt-2 leading-7 text-slate-200">
                              {highlightModelsInText(session.message)}
                            </p>
                            <p className="mt-2 text-xs text-slate-400">
                              {session.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6">
                      <div className={`grid gap-5 ${session.selectedModels.length === 1 ? 'grid-cols-1 max-w-4xl' :
                        session.selectedModels.length === 2 ? 'grid-cols-1 xl:grid-cols-2' :
                          'grid-cols-1 xl:grid-cols-3'
                        }`}>
                        {session.selectedModels.map((modelId) => {
                          const model = getModelById(modelId)
                          const response = session.responses.find(r => r.model === modelId)
                          const isLoading = loading.includes(modelId) && session.id === currentSessionId

                          if (!model) return null

                          const aiModel: AIModel = {
                            id: model.id,
                            displayName: model.label,
                            provider: model.provider,
                            description: model.description || '',
                            capabilities: model.capabilities || []
                          }

                          return (
                            <AIResponseCard
                              key={`${session.id}-${modelId}`}
                              model={aiModel}
                              content={response?.content || ''}
                              loading={isLoading}
                              error={response?.error}
                              isBestResponse={session.bestResponse === modelId}
                              onMarkBest={() => handleMarkBest(modelId)}
                              responseTime={response?.responseTime}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <div className="fiesta-panel w-full max-w-4xl rounded-[2rem] p-8 text-center sm:p-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
                  <Sparkles className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-semibold text-white">Start your AI comparison</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                  Send one prompt to multiple models and compare the results in a cleaner, easier-to-review layout.
                </p>

                <div className="fiesta-panel-soft mx-auto mt-8 max-w-3xl rounded-3xl p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setMessage(prompt)
                          setTimeout(() => textareaRef.current?.focus(), 0)
                        }}
                        className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-left transition-all duration-200 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <p className="text-sm leading-6 text-slate-200">{prompt}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!showBlankPage && (
          <div className="mt-4">
            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything to compare AI models..."
                  className={`min-h-[54px] w-full resize-none rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-[0.95rem] pr-16 text-sm leading-6 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 ${
                    isTextareaOverflowing ? 'overflow-y-auto' : 'overflow-y-hidden'
                  }`}
                  rows={1}
                  style={{ maxHeight: '110px' }}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || selectedModels.length === 0 || loading.length > 0}
                  className="fiesta-button-primary absolute right-2.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {loading.length > 0 && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-cyan-200">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-900 border-t-cyan-300" />
                  Processing...
                </div>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
