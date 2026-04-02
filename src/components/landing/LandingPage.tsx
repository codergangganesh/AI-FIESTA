'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { LogOut, MessageSquare, Star, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLoading } from '@/contexts/LoadingContext'
import { useOptimizedRouter } from '@/hooks/useOptimizedRouter'
import { usePopup } from '@/contexts/PopupContext'
import { useDarkMode } from '@/contexts/DarkModeContext'
import ModernModelShowcase from './ModernModelShowcase'
import AllModelsOverlay from './AllModelsOverlay'
import AIFiestaLogo from './AIFiestaLogo'
import VideoTutorialPopup from './VideoTutorialPopup'
import HeroSection from './sections/HeroSection'
import FeaturesSection from './sections/FeaturesSection'
import HowItWorksSection from './sections/HowItWorksSection'
import CallToActionSection from './sections/CallToActionSection'
import SiteFooter from './sections/SiteFooter'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'AI Researcher, IIT Delhi',
    avatar: 'PS',
    text: 'AI Fiesta makes it much easier to compare responses without losing context between tabs and tools.',
    gradient: 'from-blue-500 to-cyan-400'
  },
  {
    name: 'Rahul Verma',
    role: 'Senior Developer, TCS',
    avatar: 'RV',
    text: 'The new layout feels cleaner and more serious. It is easier to focus on the answer quality now.',
    gradient: 'from-emerald-500 to-cyan-500'
  },
  {
    name: 'Anjali Patel',
    role: 'Product Manager, Infosys',
    avatar: 'AP',
    text: 'This feels much closer to a real product surface for reviewing prompts with the team.',
    gradient: 'from-amber-500 to-orange-500'
  }
]

export default function LandingPage() {
  const { user, signOut } = useAuth()
  const { showLoading, hideLoading } = useLoading()
  const router = useOptimizedRouter()
  const { darkMode } = useDarkMode()
  const { openAuthPopup } = usePopup()
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [showAllModels, setShowAllModels] = useState(false)
  const [showVideoTutorial, setShowVideoTutorial] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleOpenAllModelsOverlay = () => setShowAllModels(true)
    window.addEventListener('openAllModelsOverlay', handleOpenAllModelsOverlay)
    return () => window.removeEventListener('openAllModelsOverlay', handleOpenAllModelsOverlay)
  }, [])

  useEffect(() => {
    const deleted = searchParams.get('deleted')
    const message = searchParams.get('message')

    if (deleted && message) {
      setPopupMessage(decodeURIComponent(message))
      setShowSuccessPopup(true)

      const timer = setTimeout(() => {
        setShowSuccessPopup(false)
        window.history.replaceState({}, document.title, '/')
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showProfileDropdown && !target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileDropdown])

  const getUserInitials = () => user?.email?.charAt(0).toUpperCase() || 'U'
  const getProfilePicture = () => user?.user_metadata?.avatar_url || null

  const handleSignOut = async () => {
    try {
      await signOut(showLoading, hideLoading)
      router.push('/')
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  const handleGetStarted = () => {
    if (user) {
      router.push('/chat')
    } else {
      openAuthPopup()
    }
  }

  const handleGoToChat = () => {
    if (user) {
      router.push('/chat')
    } else {
      openAuthPopup()
    }
  }

  const profilePicture = getProfilePicture()

  return (
    <div className="min-h-screen">
      <AllModelsOverlay
        show={showAllModels}
        onClose={() => setShowAllModels(false)}
        darkMode={darkMode}
      />

      <VideoTutorialPopup
        isOpen={showVideoTutorial}
        onClose={() => setShowVideoTutorial(false)}
      />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[18%] right-[10%] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {showSuccessPopup && (
        <div className="fixed right-4 top-4 z-[100]">
          <div className="fiesta-panel flex items-center gap-3 rounded-2xl px-5 py-4 text-emerald-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
              <svg className="h-5 w-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">Success</div>
              <div className="text-sm text-slate-300">{popupMessage}</div>
            </div>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="text-slate-400 hover:text-white"
              aria-label="Close notification"
              title="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-white/8 bg-slate-950/55 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <AIFiestaLogo size="md" darkMode={darkMode} simplified />
            <div>
              <div className="text-lg font-semibold tracking-tight text-white">AI Fiesta</div>
              <div className="text-xs text-slate-400">Compare models with clarity</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative profile-dropdown-container">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
                >
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    getUserInitials()
                  )}
                </button>

                {showProfileDropdown && (
                  <div className="fiesta-panel absolute right-0 mt-3 w-52 rounded-2xl p-2">
                    <Link href="/chat" onClick={() => setShowProfileDropdown(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5">
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </Link>
                    <Link href="/profile" onClick={() => setShowProfileDropdown(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5">
                      <UserIcon className="h-4 w-4" />
                      Profile
                    </Link>
                    <div className="my-2 border-t border-white/8" />
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        handleSignOut()
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-rose-200 hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthPopup}
                className="fiesta-button-primary rounded-2xl px-5 py-3 text-sm font-semibold"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </header>

      <HeroSection darkMode={darkMode} handleGetStarted={handleGetStarted} handleGoToChat={handleGoToChat} user={user} />
      <FeaturesSection darkMode={darkMode} />
      <ModernModelShowcase />
      <HowItWorksSection darkMode={darkMode} setShowVideoTutorial={setShowVideoTutorial} />

      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="fiesta-eyebrow mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
              <Star className="h-4 w-4 text-cyan-300" />
              Trusted by builders and researchers
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Feedback that matches real product use
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The interface now puts more attention on clarity, speed, and decision-making confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="fiesta-panel rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-sm font-semibold text-white`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-7 text-slate-300">{testimonial.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ['10K+', 'Active users'],
              ['500K+', 'Comparisons made'],
              ['99.9%', 'Uptime'],
              ['4.9/5', 'User rating']
            ].map(([value, label]) => (
              <div key={label} className="fiesta-panel-soft rounded-2xl p-4 text-center">
                <div className="text-2xl font-semibold text-white">{value}</div>
                <div className="mt-1 text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CallToActionSection darkMode={darkMode} user={user} />
      <SiteFooter darkMode={darkMode} />

      <style jsx>{`
        .h-18 {
          height: 4.5rem;
        }
      `}</style>
    </div>
  )
}
