'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, LogOut, User, Settings, Plus, Trash2, CreditCard, ChevronDown } from 'lucide-react'
import DeleteAccountConfirmation from './DeleteAccountConfirmation'
import DeleteAccountPopup from './DeleteAccountPopup'
import { useAuth } from '@/contexts/AuthContext'
import { usePopup } from '@/contexts/PopupContext'

interface ProfileDropdownProps {
  darkMode: boolean
  onToggleDarkMode: () => void
  onNewConversation: () => void
}

export default function ProfileDropdown({
  darkMode,
  onToggleDarkMode,
  onNewConversation
}: ProfileDropdownProps) {
  const { signOut, user } = useAuth()
  const { openPaymentPopup } = usePopup()
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleDeleteAccount = () => {
    // This is where you would implement the actual account deletion logic
    console.log('Account deleted')
    // For now, we'll just close the confirmation dialog
    setShowDeleteConfirmation(false)
  }

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

  // Function to get user display name
  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'User')
  }

  // Function to get user avatar or initial
  const getUserAvatar = (size: 'sm' | 'md' = 'sm') => {
    const dimensions = size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'

    if (user?.user_metadata?.avatar_url) {
      return (
        <img
          src={user.user_metadata.avatar_url}
          alt="Profile"
          className={`${dimensions} rounded-full object-cover`}
        />
      )
    }

    const displayName = getUserDisplayName()
    const initial = displayName.charAt(0).toUpperCase()

    return (
      <div className={`${dimensions} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md`}>
        <span className={`${size === 'sm' ? 'text-xs' : 'text-lg'} font-bold text-white`}>
          {initial}
        </span>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-gray-700/20 dark:hover:bg-gray-700/40 transition-all duration-300 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          {getUserAvatar('sm')}
          <div className="flex flex-col text-left min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-all duration-300 ${isOpen ? 'rotate-180' : ''
          }`} />
      </div>

      {/* Modern Profile Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className={`absolute bottom-full right-0 mb-3 w-80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 transform origin-bottom z-50 overflow-hidden ${darkMode
              ? 'bg-[#1a1b1e]/95 border border-white/10 backdrop-blur-3xl'
              : 'bg-white/95 border border-slate-200/60 backdrop-blur-3xl'
            }`}>
            {/* User Profile Header - Professional Look */}
            <div className={`px-6 py-5 border-b ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'
              }`}>
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  {getUserAvatar('md')}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${darkMode ? 'bg-emerald-500 border-[#1a1b1e]' : 'bg-emerald-500 border-white'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-lg tracking-tight truncate ${darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                    {getUserDisplayName()}
                  </p>
                  <p className={`text-sm tracking-tight truncate ${darkMode ? 'text-gray-400' : 'text-slate-500'
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
              {/* Main Navigation Items */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNewConversation();
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-left transition-all duration-200 group ${darkMode ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                    }`}
                >
                  <Plus className={`w-4.5 h-4.5 transition-colors ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`} />
                  <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>New Comparison</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    openPaymentPopup();
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-left transition-all duration-200 group ${darkMode ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                    }`}
                >
                  <CreditCard className={`w-4.5 h-4.5 transition-colors ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`} />
                  <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>Subscription & Billing</span>
                </button>

                <Link href="/profile" className="block">
                  <div
                    className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-left transition-all duration-200 group ${darkMode ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <User className={`w-4.5 h-4.5 transition-colors ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`} />
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>Account Settings</span>
                  </div>
                </Link>
              </div>

              {/* Utility Section */}
              <div className={`mt-2 pt-2 border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <div
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${darkMode ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleDarkMode();
                    setIsOpen(false);
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

              {/* Critical Actions */}
              <div className={`mt-2 pt-2 border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowDeletePopup(true);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-left transition-all duration-200 group ${darkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'
                    }`}
                >
                  <Trash2 className={`w-4.5 h-4.5 text-rose-500 group-hover:text-rose-600 transition-colors`} />
                  <span className="text-sm font-semibold text-rose-500 group-hover:text-rose-600">Delete Account</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-left transition-all duration-200 group ${darkMode ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                    }`}
                >
                  <LogOut className={`w-4.5 h-4.5 ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'} transition-colors`} />
                  <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <DeleteAccountConfirmation
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteAccount}
      />

      <DeleteAccountPopup
        isOpen={showDeletePopup}
        onClose={() => setShowDeletePopup(false)}
        onConfirm={handleDeleteAccountConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}