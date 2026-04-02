'use client'

import React from 'react'
import { Award, ChevronRight, Shield, Sparkles, TrendingUp } from 'lucide-react'
import { usePopup } from '@/contexts/PopupContext'
import { useOptimizedRouter } from '@/hooks/useOptimizedRouter'
import ScrollReveal from '@/components/ui/scroll-reveal'

interface CallToActionSectionProps {
  darkMode: boolean
  user: { email?: string; user_metadata?: { full_name?: string } } | null
}

export default function CallToActionSection({ darkMode, user }: CallToActionSectionProps) {
  const { openAuthPopup } = usePopup()
  const router = useOptimizedRouter()

  const handleAuthNavigation = () => {
    if (user) {
      router.push('/chat')
    } else {
      openAuthPopup()
    }
  }

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-x-0 top-12 mx-auto h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="fiesta-panel rounded-[2rem] px-6 py-10 text-center sm:px-10 sm:py-14">
          <ScrollReveal>
            <div className="fiesta-eyebrow mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
              <Sparkles className={`h-4 w-4 ${darkMode ? 'text-cyan-300' : 'text-blue-500'}`} />
              Ready to compare AI models?
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Upgrade the experience from
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-amber-200 bg-clip-text text-transparent">
                curiosity to confident choice.
              </span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              AI Fiesta now feels more deliberate, more readable, and much closer to a production product surface for real comparison work.
            </p>
          </ScrollReveal>

          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <button
              onClick={handleAuthNavigation}
              className="fiesta-button-primary inline-flex items-center gap-3 rounded-2xl px-7 py-4 text-base font-semibold transition-transform duration-200 hover:-translate-y-0.5"
            >
              <Sparkles className="h-5 w-5" />
              Start Free Today
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="fiesta-panel-soft rounded-2xl px-4 py-3 text-left text-sm text-slate-300">
              <div className="font-medium text-white">Free to explore</div>
              <div>No credit card required</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Shield, label: 'Secure product shell' },
              { icon: Award, label: 'Cleaner UI hierarchy' },
              { icon: TrendingUp, label: 'Built for repeat usage' }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="fiesta-panel-soft flex items-center gap-2 rounded-full px-4 py-2 text-sm text-slate-300">
                <Icon className="h-4 w-4 text-cyan-300" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
