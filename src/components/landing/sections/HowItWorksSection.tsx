'use client'

import React from 'react'
import { Brain, MessageSquare, Play, Star } from 'lucide-react'

interface Step {
  number: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface HowItWorksSectionProps {
  darkMode: boolean
  setShowVideoTutorial: (show: boolean) => void
}

export default function HowItWorksSection({ darkMode, setShowVideoTutorial }: HowItWorksSectionProps) {
  const steps: Step[] = [
    {
      number: '01',
      title: 'Choose Models',
      description: 'Pick the models you want to compare and keep the evaluation focused.',
      icon: Brain
    },
    {
      number: '02',
      title: 'Send One Prompt',
      description: 'Write once and distribute the same prompt across the selected models.',
      icon: MessageSquare
    },
    {
      number: '03',
      title: 'Review Side by Side',
      description: 'Use cleaner cards and clearer hierarchy to identify the strongest answer quickly.',
      icon: Star
    }
  ]

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <button
            onClick={() => setShowVideoTutorial(true)}
            className="fiesta-eyebrow inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          >
            <Play className={`h-4 w-4 ${darkMode ? 'text-cyan-300' : 'text-blue-500'}`} />
            How it works
          </button>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Three steps to a better comparison flow
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            The structure is simple on purpose: reduce friction, compare faster, and keep decisions obvious.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-[calc(100%-1rem)] top-12 hidden h-px w-8 bg-gradient-to-r from-cyan-400/60 to-transparent lg:block" />
                )}
                <div className="fiesta-panel h-full rounded-3xl p-8">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
                      <Icon className="h-8 w-8" />
                    </div>
                    <span className="text-sm font-medium tracking-[0.3em] text-slate-400">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
