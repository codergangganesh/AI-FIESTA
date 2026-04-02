'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, Filter, Grid3X3, List, MessageSquare, RotateCcw, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { chatHistoryService } from '@/services/chatHistory.service'
import SharedSidebar from '../layout/SharedSidebar'
import HistoryDetailModal from './HistoryDetailModal'
import { AVAILABLE_MODELS } from '@/lib/models'
import { ChatResponse } from '@/types/chat'

interface ChatSession {
  id: string
  message: string
  timestamp: Date
  selectedModels: string[]
  responseCount: number
  responses?: ChatResponse[]
  bestResponse?: string
  responseTime?: number
}

let chatSessionsCache: ChatSession[] | null = null
let lastFetchTime: number | null = null
const CACHE_DURATION = 5 * 60 * 1000

export default function ModernHistoryInterface() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostResponses'>('newest')
  const [filterByModel, setFilterByModel] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [modalSession, setModalSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadChatSessions = useCallback(async () => {
    const serviceCache = chatHistoryService.getCachedChatSessions()
    if (serviceCache) {
      const sessions = serviceCache.map(session => ({
        ...session,
        timestamp: session.timestamp instanceof Date ? session.timestamp : new Date(session.timestamp),
        responseCount: session.responses ? session.responses.length : 0
      }))
      setChatSessions(sessions)
      setIsLoading(false)
      return
    }

    const now = Date.now()
    if (chatSessionsCache && lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
      setChatSessions(chatSessionsCache)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const apiSessions = await chatHistoryService.getChatSessions()
      let localSessions: ChatSession[] = []
      const savedSessions = localStorage.getItem('aiFiestaChatSessions')

      if (savedSessions) {
        try {
          const parsed = JSON.parse(savedSessions)
          localSessions = parsed.map((session: ChatSession) => ({
            ...session,
            timestamp: session.timestamp instanceof Date ? session.timestamp : new Date(session.timestamp),
            responseCount: session.responses ? session.responses.length : 0
          }))
        } catch (e) {
          console.error('Failed to parse saved sessions:', e)
        }
      }

      let finalSessions: ChatSession[] = []
      if (apiSessions) {
        const formattedApiSessions = apiSessions.map((session) => ({
          ...session,
          timestamp: session.timestamp instanceof Date ? session.timestamp : new Date(session.timestamp),
          responseCount: session.responses ? session.responses.length : 0
        }))

        const apiIds = new Set(formattedApiSessions.map(s => s.id))
        finalSessions = [...formattedApiSessions, ...localSessions.filter(s => !apiIds.has(s.id))]
      } else {
        finalSessions = localSessions
      }

      finalSessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      chatSessionsCache = finalSessions
      lastFetchTime = now
      setChatSessions(finalSessions)
    } catch (err) {
      console.error('Error loading chat sessions:', err)
      setError('Failed to load chat history. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadChatSessions()
  }, [loadChatSessions])

  const filteredSessions = useMemo(() => {
    const result = [...chatSessions]
      .filter(session =>
        (!searchTerm || session.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.selectedModels.some(model => model.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (filterByModel === 'all' || session.selectedModels.includes(filterByModel))
      )

    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        break
      case 'mostResponses':
        result.sort((a, b) => b.responseCount - a.responseCount)
        break
      default:
        result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }

    return result
  }, [chatSessions, filterByModel, searchTerm, sortBy])

  const uniqueModels = useMemo(() => {
    const models = new Set<string>()
    chatSessions.forEach(session => session.selectedModels.forEach(model => models.add(model)))
    return Array.from(models)
  }, [chatSessions])

  const handleDeleteSession = async (id: string) => {
    await chatHistoryService.deleteChatSession(id)
    const updated = chatSessions.filter(session => session.id !== id)
    setChatSessions(updated)
    chatSessionsCache = updated

    const savedSessions = localStorage.getItem('aiFiestaChatSessions')
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions)
        localStorage.setItem('aiFiestaChatSessions', JSON.stringify(parsed.filter((session: ChatSession) => session.id !== id)))
      } catch (e) {
        console.error('Failed to update localStorage:', e)
      }
    }
  }

  const handleDeleteAllSessions = async () => {
    setIsDeletingAll(true)
    try {
      await Promise.all(chatSessions.map(session => chatHistoryService.deleteChatSession(session.id)))
      setChatSessions([])
      chatSessionsCache = []
      localStorage.removeItem('aiFiestaChatSessions')
    } finally {
      setIsDeletingAll(false)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const getModelById = (modelId: string) => AVAILABLE_MODELS.find(model => model.id === modelId)

  return (
    <div className="flex h-screen bg-transparent text-white">
      <SharedSidebar />

      <main className="m-4 flex min-w-0 flex-1 flex-col">
        <div className="fiesta-panel rounded-[1.75rem] px-5 py-5 sm:px-6">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-white">Conversation history</h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={loadChatSessions}
                  className="fiesta-button-secondary inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium"
                >
                  <RotateCcw className="h-4 w-4" />
                  Refresh
                </button>
                <Link href="/chat" className="fiesta-button-primary rounded-2xl px-4 py-2.5 text-sm font-medium">
                  New Comparison
                </Link>
                <button
                  onClick={handleDeleteAllSessions}
                  disabled={isDeletingAll || chatSessions.length === 0}
                  className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isDeletingAll ? 'Deleting...' : 'Delete All'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_220px_200px_160px]">
              <label className="fiesta-panel-soft flex items-center gap-3 rounded-2xl px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search prompts or model names..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </label>

              <label className="fiesta-panel-soft flex items-center gap-3 rounded-2xl px-4 py-3">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={filterByModel}
                  onChange={(e) => setFilterByModel(e.target.value)}
                  className="w-full bg-transparent text-sm text-white focus:outline-none"
                >
                  <option value="all" className="bg-slate-900">All models</option>
                  {uniqueModels.map(modelId => {
                    const model = getModelById(modelId)
                    return (
                      <option key={modelId} value={modelId} className="bg-slate-900">
                        {model?.provider || modelId}
                      </option>
                    )
                  })}
                </select>
              </label>

              <div className="fiesta-panel-soft flex items-center gap-3 rounded-2xl px-4 py-3">
                <span className="text-sm text-slate-400">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full bg-transparent text-sm text-white focus:outline-none"
                >
                  <option value="newest" className="bg-slate-900">Newest</option>
                  <option value="oldest" className="bg-slate-900">Oldest</option>
                  <option value="mostResponses" className="bg-slate-900">Most responses</option>
                </select>
              </div>

              <div className="fiesta-panel-soft flex items-center justify-between rounded-2xl px-2 py-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
              </div>
            </div>

            {uniqueModels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterByModel('all')}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    filterByModel === 'all'
                      ? 'border-cyan-400/30 bg-cyan-400/12 text-cyan-200'
                      : 'border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  All models
                </button>
                {uniqueModels.map((modelId) => {
                  const model = getModelById(modelId)
                  return (
                    <button
                      key={modelId}
                      onClick={() => setFilterByModel(modelId)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        filterByModel === modelId
                          ? 'border-cyan-400/30 bg-cyan-400/12 text-cyan-200'
                          : 'border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      {model?.label || modelId}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-hidden">
          <div className="fiesta-panel h-full rounded-[1.75rem] p-5 sm:p-6">
            <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col">
              {isLoading ? (
                <div className="flex flex-1 items-center justify-center text-slate-300">Loading history...</div>
              ) : error ? (
                <div className="flex flex-1 items-center justify-center text-rose-200">{error}</div>
              ) : filteredSessions.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                      <MessageSquare className="h-8 w-8 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">No conversations found</h2>
                  </div>
                </div>
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                      {filteredSessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => setModalSession(session)}
                          role="button"
                          tabIndex={0}
                          className="fiesta-panel-soft rounded-3xl p-5 text-left transition-transform duration-200 hover:-translate-y-1 cursor-pointer w-full block focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        >
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Calendar className="h-4 w-4" />
                              {formatTimeAgo(session.timestamp)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSession(session.id)
                              }}
                              className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-200"
                              title="Delete conversation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <h3 className="line-clamp-3 text-lg font-semibold leading-7 text-white">{session.message}</h3>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {session.selectedModels.slice(0, 3).map((modelId) => {
                              const model = getModelById(modelId)
                              return (
                                <span key={modelId} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                  {model?.provider || modelId}
                                </span>
                              )
                            })}
                            {session.selectedModels.length > 3 && (
                              <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                +{session.selectedModels.length - 3}
                              </span>
                            )}
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-sm">
                            <div className="flex items-center gap-2 text-cyan-200">
                              <MessageSquare className="h-4 w-4" />
                              {session.responseCount} responses
                            </div>
                            <span className="text-slate-400">View details</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredSessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => setModalSession(session)}
                          role="button"
                          tabIndex={0}
                          className="fiesta-panel-soft flex w-full flex-col gap-4 rounded-3xl p-5 text-left xl:flex-row xl:items-center xl:justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 text-xs text-slate-400">{formatTimeAgo(session.timestamp)}</div>
                            <h3 className="line-clamp-2 text-lg font-semibold leading-7 text-white">{session.message}</h3>
                          </div>

                          <div className="flex flex-wrap gap-2 xl:max-w-[360px] xl:justify-end">
                            {session.selectedModels.slice(0, 3).map((modelId) => {
                              const model = getModelById(modelId)
                              return (
                                <span key={modelId} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                  {model?.provider || modelId}
                                </span>
                              )
                            })}
                            {session.selectedModels.length > 3 && (
                              <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                +{session.selectedModels.length - 3}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-4 xl:min-w-[180px] xl:justify-end">
                            <div className="text-sm text-cyan-200">{session.responseCount} responses</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSession(session.id)
                              }}
                              className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-200"
                              title="Delete conversation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {modalSession && (
        <HistoryDetailModal session={modalSession} onClose={() => setModalSession(null)} />
      )}
    </div>
  )
}
