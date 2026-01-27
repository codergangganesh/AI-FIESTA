'use client'

import { useState, useRef, useEffect } from 'react'
import { Brain, Plus, MessageSquare, Clock, BarChart3, ChevronDown, User, LogOut, CreditCard, Moon, Sun, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { usePopup } from '@/contexts/PopupContext'
import DeleteAccountPopup from '../../layout/DeleteAccountPopup'
import AIFiestaLogo from '@/components/landing/AIFiestaLogo'

interface ChatSidebarProps {
  darkMode: boolean
  showBlankPage: boolean
  setShowBlankPage: (show: boolean) => void
  showDeletePopup: boolean
  setShowDeletePopup: (show: boolean) => void
  isDeleting: boolean
  setIsDeleting: (deleting: boolean) => void
  user: { email?: string; user_metadata?: { avatar_url?: string; full_name?: string } } | null
  signOut: () => void
}

export default function ChatSidebar({
  darkMode,
  showBlankPage,
  setShowBlankPage,
  showDeletePopup,
  setShowDeletePopup,
  isDeleting,
  setIsDeleting,
  user,
  signOut
}: ChatSidebarProps) {
  const { openPaymentPopup } = usePopup()
  const { toggleDarkMode } = useDarkMode()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNewChat = () => {
    setShowBlankPage(true)
  }

  // Add the delete account confirmation handler
  const handleDeleteAccountConfirm = async (password: string) => {
    setIsDeleting(true)
    try {
      // Here you would implement the actual account deletion logic
      // This might involve:
      // 1. Verifying the password with your authentication service
      // 2. Deleting user data from your database
      // 3. Deleting the user from your authentication service
      // 4. Signing out the user
      console.log('Deleting account with password:', password)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // After successful deletion, sign out the user
      await signOut()
    } catch (error) {
      console.error('Error deleting account:', error)
      // Handle error (show error message to user)
    } finally {
      setIsDeleting(false)
      setShowDeletePopup(false)
    }
  }

  return (
    <>
      {/* Left Sidebar */}
      <div className={`w-80 backdrop-blur-xl border-r transition-colors duration-200 relative ${darkMode
        ? 'bg-gray-800/80 border-gray-700'
        : 'bg-white/80 border-slate-200/50'
        }`}>
        {/* Sidebar Content Container */}
        <div className="flex flex-col h-full pb-20"> {/* Added bottom padding for dropdown */}
          {/* Header with Logo */}
          <div className={`p-6 border-b transition-colors duration-200 ${darkMode ? 'border-gray-700' : 'border-slate-200/30'
            }`}>
            <div className="flex items-center space-x-3 mb-6">
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

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center space-x-3 px-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg shadow-indigo-500/20 transform hover:scale-[1.02] active:scale-[0.98] group relative"
              title="Start New Comparison"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              <span>New Comparison</span>
              {/* Tooltip for hover */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                Start a new AI model comparison
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 -mr-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-r-gray-900 border-t-transparent border-b-transparent"></div>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <div className="p-4 space-y-2">
            <Link
              href="/chat"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${darkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              title="Current Chat"
            >
              <MessageSquare className="w-5 h-5 transition-colors group-hover:text-blue-600" />
              <span className="font-medium">Current Chat</span>
              {/* Tooltip for hover */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                View your current chat session
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 -mr-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-r-gray-900 border-t-transparent border-b-transparent"></div>
              </div>
            </Link>

            <Link
              href="/history"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${darkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              title="History"
            >
              <Clock className="w-5 h-5 transition-colors group-hover:text-blue-600" />
              <span className="font-medium">History</span>
              {/* Tooltip for hover */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                View your chat history
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 -mr-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-r-gray-900 border-t-transparent border-b-transparent"></div>
              </div>
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${darkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              title="Dashboard"
            >
              <BarChart3 className="w-5 h-5 transition-colors group-hover:text-blue-600" />
              <span className="font-medium">Dashboard</span>
              {/* Tooltip for hover */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                View analytics and statistics
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 -mr-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-r-gray-900 border-t-transparent border-b-transparent"></div>
              </div>
            </Link>
          </div>
        </div>

        {/* Profile Section at Bottom */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t transition-colors duration-200 ${darkMode
          ? 'bg-gray-800/95 border-gray-700 backdrop-blur-xl'
          : 'bg-white/95 border-slate-200/30 backdrop-blur-xl'
          }`}>
          <div className="relative" ref={profileDropdownRef}>
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-gray-700/10 dark:hover:bg-gray-700/30 p-2 rounded-lg transition-all duration-300 ease-out"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              title="User Profile"
            >
              <div className="text-sm text-slate-700 dark:text-gray-300 truncate">
                {user?.email || 'user@example.com'}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white">
                      {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-gray-400 transition-all duration-300 ease-out ${showProfileDropdown ? 'rotate-180' : ''
                  }`} />
              </div>
            </div>

            {/* Modern Profile Dropdown Menu */}
            {showProfileDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileDropdown(false)}
                  aria-hidden="true"
                />
                <div className={`absolute bottom-full right-0 mb-3 w-80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 transform origin-bottom z-50 overflow-hidden ${darkMode
                  ? 'bg-[#1a1b1e]/95 border border-white/10 backdrop-blur-3xl'
                  : 'bg-white/95 border border-slate-200/60 backdrop-blur-3xl'
                  }`}>
                  {/* User Profile Header - Professional Look */}
                  <div className={`px-6 py-5 border-b ${darkMode
                    ? 'border-white/5 bg-white/[0.02]'
                    : 'border-slate-100 bg-slate-50/50'
                    }`}>
                    <div className="flex items-center space-x-4">
                      <div className="relative group">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden">
                          {user?.user_metadata?.avatar_url ? (
                            <img
                              src={user.user_metadata.avatar_url}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                            </span>
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${darkMode ? 'bg-emerald-500 border-[#1a1b1e]' : 'bg-emerald-500 border-white'}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-lg tracking-tight truncate ${darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                          {user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'User')}
                        </p>
                        <p className={`text-sm tracking-tight truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {user?.email || 'user@example.com'}
                        </p>
                        <div className="mt-2.5 flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${darkMode
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                            Premium Member
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    {/* Action Items */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          openPaymentPopup();
                        }}
                        className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-left transition-all duration-200 group ${darkMode
                          ? 'hover:bg-white/[0.05]'
                          : 'hover:bg-slate-100'
                          }`}
                      >
                        <CreditCard className={`w-4.5 h-4.5 transition-colors ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`} />
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200 group-hover:text-white' : 'text-gray-800'
                            }`}>Subscription & Billing</p>
                        </div>
                      </button>

                      <Link href="/dashboard/profile" className="block">
                        <div
                          className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-left transition-all duration-200 group ${darkMode
                            ? 'hover:bg-white/[0.05]'
                            : 'hover:bg-slate-100'
                            }`}
                          onClick={() => {
                            setShowProfileDropdown(false);
                          }}>
                          <User className={`w-4.5 h-4.5 transition-colors ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200 group-hover:text-white' : 'text-gray-800'
                              }`}>Account Settings</p>
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* Theme Toggle Section */}
                    <div className={`mt-2 pt-2 border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <div
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${darkMode
                          ? 'hover:bg-white/[0.05]'
                          : 'hover:bg-slate-100'
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowProfileDropdown(false);
                          toggleDarkMode();
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          {darkMode ? (
                            <Sun className="w-4.5 h-4.5 text-gray-400 group-hover:text-amber-400 transition-colors" />
                          ) : (
                            <Moon className="w-4.5 h-4.5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                          )}
                          <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                            {darkMode ? 'Light Theme' : 'Dark Theme'}
                          </span>
                        </div>
                        <div className={`relative w-9 h-5 rounded-full transition-all duration-300 ${darkMode ? 'bg-blue-600' : 'bg-slate-200'
                          }`}>
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${darkMode ? 'left-5' : 'left-1'
                            }`}></div>
                        </div>
                      </div>
                    </div>

                    {/* Critical Actions Section */}
                    <div className={`mt-2 pt-2 border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <div
                        className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-left cursor-pointer transition-all duration-200 group ${darkMode
                          ? 'hover:bg-rose-500/10'
                          : 'hover:bg-rose-50'
                          }`}
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setShowDeletePopup(true);
                        }}
                      >
                        <Trash2 className="w-4.5 h-4.5 text-rose-500 group-hover:text-rose-600 transition-colors" />
                        <div className="flex-1">
                          <p className={`text-sm font-semibold text-rose-500 group-hover:text-rose-600`}>Delete Account</p>
                        </div>
                      </div>

                      <div
                        className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-left cursor-pointer transition-all duration-200 group ${darkMode
                          ? 'hover:bg-white/[0.05]'
                          : 'hover:bg-slate-100'
                          }`}
                        onClick={() => {
                          setShowProfileDropdown(false);
                          signOut();
                        }}
                      >
                        <LogOut className={`w-4.5 h-4.5 ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'} transition-colors`} />
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200 group-hover:text-white' : 'text-gray-800'
                            }`}>Sign Out</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add DeleteAccountPopup at the end of the component */}
      <DeleteAccountPopup
        isOpen={showDeletePopup}
        onClose={() => setShowDeletePopup(false)}
        onConfirm={handleDeleteAccountConfirm}
        isLoading={isDeleting}
      />
    </>
  )
}