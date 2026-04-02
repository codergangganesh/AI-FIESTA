'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Clock, MessageSquare, Plus } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import AIFiestaLogo from '@/components/landing/AIFiestaLogo'
import ProfileDropdown from '@/components/layout/ProfileDropdown'

interface SharedSidebarProps {
  onDeletePopupOpen?: () => void
  showDeletePopup?: boolean
  onDeletePopupClose?: () => void
  onDeleteConfirm?: (password: string) => void
  isDeleting?: boolean
}

export default function SharedSidebar({}: SharedSidebarProps) {
  const { darkMode } = useDarkMode()
  const pathname = usePathname()

  return (
    <aside className="fiesta-panel m-4 hidden h-[calc(100vh-2rem)] w-72 rounded-[1.75rem] lg:flex lg:flex-col">
      <div className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="mb-6 border-b border-white/8 pb-5">
            <div className="mb-6 flex items-center gap-3">
              <AIFiestaLogo size="md" darkMode={darkMode} />
              <div>
                <Link href="/" className="block text-xl font-semibold text-white">
                  AI Fiesta
                </Link>
              </div>
            </div>

            <Link href="/chat" className="block">
              <button className="fiesta-button-primary flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-sm font-semibold">
                <Plus className="h-5 w-5" />
                New Comparison
              </button>
            </Link>
          </div>

          <nav className="space-y-2">
            <Link
              href="/chat"
              prefetch
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                pathname === '/chat' ? 'bg-white/8 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              Current Chat
            </Link>

            <Link
              href="/history"
              prefetch
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                pathname === '/history' ? 'bg-white/8 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Clock className="h-5 w-5" />
              History
            </Link>

            <Link
              href="/dashboard"
              prefetch
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                pathname === '/dashboard' || pathname.startsWith('/dashboard/')
                  ? 'bg-white/8 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
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
  )
}
