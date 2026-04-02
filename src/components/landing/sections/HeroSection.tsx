'use client'

import React, { useState } from 'react'
import { Cpu, Infinity, MessageSquare, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { ChatInput } from '@/components/ui/bolt-style-chat'
import ScrollReveal from '@/components/ui/scroll-reveal'
import { usePopup } from '@/contexts/PopupContext'
import { useOptimizedRouter } from '@/hooks/useOptimizedRouter'
import { AVAILABLE_MODELS } from '@/lib/models'

interface HeroSectionProps {
  darkMode: boolean
  handleGetStarted: () => void
  handleGoToChat: () => void
  user: { email?: string; user_metadata?: { full_name?: string } } | null
}

export default function HeroSection({
  handleGetStarted,
  handleGoToChat,
  user
}: HeroSectionProps) {
  const { openAuthPopup } = usePopup()
  const router = useOptimizedRouter()
  const [testInput, setTestInput] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>(() => {
    if (!AVAILABLE_MODELS || AVAILABLE_MODELS.length === 0) return []
    return AVAILABLE_MODELS.slice(0, 2).map(m => m.id)
  })

  const handleClick = () => {
    if (user) {
      handleGoToChat()
    } else {
      handleGetStarted()
    }
  }

  const handleTestSubmit = () => {
    if (!testInput.trim()) return

    localStorage.setItem('pendingMessage', testInput.trim())
    localStorage.setItem('pendingModels', JSON.stringify(selectedModels))

    if (user) {
      router.push('/chat')
      return
    }

    openAuthPopup()
  }

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => {
      const isSelected = prev.includes(modelId)

      if (isSelected) {
        if (prev.length === 1) return prev
        return prev.filter(id => id !== modelId)
      }

      if (prev.length >= 3) return prev
      return [...prev, modelId]
    })
  }

  const stats = [
    { label: 'AI Models', value: '9+', icon: Cpu, tone: 'from-blue-500 to-cyan-400' },
    { label: 'Universal Input', value: '1', icon: MessageSquare, tone: 'from-emerald-500 to-cyan-500' },
    { label: 'Comparisons', value: 'Infinity', icon: Infinity, tone: 'from-amber-500 to-orange-500' },
    { label: 'Parallel Runs', value: 'Fast', icon: Zap, tone: 'from-sky-500 to-blue-500' },
  ]

  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="fiesta-grid absolute inset-x-0 top-0 h-[38rem] opacity-60" />
      <div className="absolute inset-x-0 top-24 mx-auto h-80 w-80 rounded-full bg-cyan-400/12 blur-3xl" />
      <div className="absolute right-0 top-16 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <ScrollReveal>
            <div
              onClick={handleClick}
              className="fiesta-eyebrow inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span>Compare 9+ premium AI models in one workspace</span>
            </div>
          </ScrollReveal>

          <div className="mb-8">
            <ScrollReveal delay={0.2}>
              <h1
                onClick={handleClick}
                className="cursor-pointer text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                <span className="block">Production-grade AI comparison,</span>
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-amber-200 bg-clip-text text-transparent">
                  designed for fast decisions.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
                Ask once, compare answers side by side, and move from exploration to confident choice without cluttered prompts, noisy layouts, or tab-hopping.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.4}>
            <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
              {[
                'Compare answers from up to 3 models in one run.',
                'Read outputs in cleaner cards with better hierarchy.',
                'Built for prompt testing, research, and product workflows.'
              ].map((item) => (
                <div key={item} className="fiesta-panel-soft rounded-2xl px-4 py-4 text-sm leading-6 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <div className="relative z-50 mx-auto mb-12 max-w-5xl">
            <ChatInput
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onSend={handleTestSubmit}
              selectedModels={selectedModels}
              onModelToggle={handleModelToggle}
              availableModels={AVAILABLE_MODELS.map(m => ({
                id: m.id,
                name: m.label,
                description: m.description,
                provider: m.provider,
                badge: m.provider === 'Anthropic' ? 'Pro' : undefined
              }))}
            />
          </div>

          <ScrollReveal delay={0.6}>
            <div className="grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-4">
              {stats.map(({ label, value, icon: Icon, tone }) => (
                <div
                  key={label}
                  onClick={handleClick}
                  className="fiesta-panel-soft group cursor-pointer rounded-3xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mb-2 text-3xl font-semibold text-white">{value}</div>
                  <div className="text-sm font-medium text-slate-300">{label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.7}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
              <div className="fiesta-panel-soft flex items-center gap-2 rounded-full px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Structured, readable comparison surfaces
              </div>
              <div className="fiesta-panel-soft rounded-full px-4 py-2">
                Better prompt evaluation workflow
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
