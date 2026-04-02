'use client'

import React from 'react'
import { BarChart3, Clock, MessageSquare, Shield, Users, Zap } from 'lucide-react'
import ScrollReveal from '@/components/ui/scroll-reveal'

interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  stats: string
  tone: string
}

interface FeaturesSectionProps {
  darkMode: boolean
}

export default function FeaturesSection({ darkMode }: FeaturesSectionProps) {
  const features: Feature[] = [
    {
      icon: MessageSquare,
      title: 'Single Prompt Workflow',
      description: 'Write once and send the same prompt to every selected model without duplicate effort.',
      stats: '1 prompt, many answers',
      tone: 'from-blue-500 to-cyan-400'
    },
    {
      icon: Zap,
      title: 'Faster Evaluation',
      description: 'Trim review time with parallel responses and a layout that makes differences easier to scan.',
      stats: 'Parallel comparison',
      tone: 'from-sky-500 to-blue-500'
    },
    {
      icon: BarChart3,
      title: 'Clearer Decisions',
      description: 'Side-by-side result cards help teams compare quality, tone, and usefulness with less noise.',
      stats: 'Readable output',
      tone: 'from-emerald-500 to-teal-400'
    },
    {
      icon: Shield,
      title: 'Trusted Product Shell',
      description: 'The interface now uses stronger contrast, steadier surfaces, and cleaner information density.',
      stats: 'Production-focused UI',
      tone: 'from-amber-500 to-orange-500'
    },
    {
      icon: Clock,
      title: 'History-Friendly Flow',
      description: 'Navigate from active comparisons to dashboard and history with less visual friction.',
      stats: 'Built for reuse',
      tone: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Users,
      title: 'Team-Ready Experience',
      description: 'Works better for developers, researchers, and product teams reviewing prompts together.',
      stats: 'Research to production',
      tone: 'from-cyan-500 to-emerald-400'
    }
  ]

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="fiesta-eyebrow mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            <Zap className={`h-4 w-4 ${darkMode ? 'text-cyan-300' : 'text-blue-500'}`} />
            Powerful features
          </div>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Built to feel like a product,
            <span className="block text-slate-300">not a prototype.</span>
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Every major surface now leans into clarity, speed, and consistency so users can focus on the answers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <ScrollReveal key={feature.title} delay={index * 0.08}>
                <div className="fiesta-panel h-full rounded-3xl p-7">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.tone} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                      {feature.stats}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{feature.description}</p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
