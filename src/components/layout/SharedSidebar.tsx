'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, BarChart3, Plus, Clock } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import NotificationBell from '@/components/ui/NotificationBell'
import AIFiestaLogo from '@/components/landing/AIFiestaLogo'
import ProfileDropdown from '@/components/layout/ProfileDropdown'

interface SharedSidebarProps {
  onDeletePopupOpen?: () => void
  showDeletePopup?: boolean
  onDeletePopupClose?: () => void
  onDeleteConfirm?: (password: string) => void
  isDeleting?: boolean
}

export default function SharedSidebar({
  onDeletePopupOpen,
  showDeletePopup = false,
  onDeletePopupClose,
  onDeleteConfirm,
  isDeleting = false
}: SharedSidebarProps) {
  const { darkMode } = useDarkMode()
  const pathname = usePathname()

  return (
    // Updated sidebar background to match Chat/History pages
    <div className={`fixed left-0 top-0 h-full w-80 backdrop-blur-xl border-r transition-colors duration-200 z-10 ${darkMode
      ? 'bg-gray-800/80 border-gray-700'
      : 'bg-white/80 border-slate-200/50'
      }`}>
      <div className="flex flex-col h-full pb-20">
        {/* Header with Logo */}
        <div className={`p-6 border-b transition-colors duration-200 ${darkMode ? 'border-gray-700' : 'border-slate-200/30'
          }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <AIFiestaLogo size="md" darkMode={darkMode} />
              <div>
                <Link href="/">
                  <h1 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-colors duration-200 ${darkMode
                    ? 'from-white to-gray-200'
                    : 'from-slate-900 to-slate-700'
                    }`}>
                    AI Fiesta
                  </h1>
                </Link>
              </div>
            </div>
          </div>

          {/* New Chat Button */}
          <Link href="/chat">
            <button
              className="w-full flex items-center justify-center space-x-3 px-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg shadow-indigo-500/20 transform hover:scale-[1.02] active:scale-[0.98] group relative"
              title="Start New Comparison"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              <span>New Comparison</span>
            </button>
          </Link>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          <Link
            href="/chat"
            prefetch={true}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${pathname === '/chat'
              ? darkMode
                ? 'text-white bg-gray-700/50 border border-gray-600'
                : 'text-slate-900 bg-slate-100/50 border border-slate-200'
              : darkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Current Chat</span>
          </Link>

          <Link
            href="/history"
            prefetch={true}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${pathname === '/history'
              ? darkMode
                ? 'text-white bg-gray-700/50 border border-gray-600'
                : 'text-slate-900 bg-slate-100/50 border border-slate-200'
              : darkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">History</span>
          </Link>

          <Link
            href="/dashboard"
            prefetch={true}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${pathname === '/dashboard'
              ? darkMode
                ? 'text-white bg-gray-700/50 border border-gray-600'
                : 'text-slate-900 bg-slate-100/50 border border-slate-200'
              : darkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Profile Section at Bottom */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t transition-all duration-300 ${darkMode
        ? 'bg-gray-800/90 border-gray-700/50 backdrop-blur-xl'
        : 'bg-white/90 border-slate-200/50 backdrop-blur-xl'
        }`}>
        <ProfileDropdown />
      </div>

    </div>
  )
}