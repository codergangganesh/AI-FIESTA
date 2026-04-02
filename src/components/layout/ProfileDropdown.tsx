'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import DeleteAccountPopup from './DeleteAccountPopup'
import { useAuth } from '@/contexts/AuthContext'
import { useDarkMode } from '@/contexts/DarkModeContext'

export default function ProfileDropdown() {
  const { signOut, user } = useAuth()
  const { darkMode } = useDarkMode()
  const [isOpen, setIsOpen] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDeleteAccountConfirm = async (password: string) => {
    setIsDeleting(true)
    try {
      console.log('Deleting account with password:', password)
      await new Promise(resolve => setTimeout(resolve, 1500))
      await signOut()
    } catch (error) {
      console.error('Error deleting account:', error)
    } finally {
      setIsDeleting(false)
      setShowDeletePopup(false)
    }
  }

  const displayName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'User')
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex w-full items-center gap-3 rounded-[1.35rem] border px-3.5 py-3 text-left transition-all ${
          darkMode
            ? 'border-white/10 bg-white/[0.04] hover:border-white/15 hover:bg-white/[0.06]'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title="Account menu"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
          darkMode
            ? 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-200 ring-1 ring-white/10'
            : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
        }`}>
          {userInitial}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`truncate text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{displayName}</div>
          <div className={`truncate text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email || 'user@example.com'}</div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className={`absolute bottom-full left-0 z-50 mb-3 w-[min(19rem,calc(100vw-2rem))] rounded-[1.6rem] border p-2.5 shadow-[0_24px_80px_rgba(15,23,42,0.28)] ${
            darkMode
              ? 'border-white/10 bg-slate-950/95 backdrop-blur-2xl'
              : 'border-slate-200 bg-white/95 backdrop-blur-2xl'
          }`}>
            <div className={`rounded-[1.2rem] border px-4 py-3 ${
              darkMode
                ? 'border-white/8 bg-white/[0.03]'
                : 'border-slate-200 bg-slate-50/80'
            }`}>
              <div className={`truncate text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{displayName}</div>
              <div className={`mt-1 truncate text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email || 'user@example.com'}</div>
            </div>

            <div className="mt-2 space-y-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className={`block rounded-[1rem] px-3.5 py-3 text-sm font-medium ${
                  darkMode ? 'text-slate-200 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                View profile
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false)
                  signOut()
                }}
                className={`block w-full rounded-[1rem] px-3.5 py-3 text-left text-sm font-medium ${
                  darkMode ? 'text-slate-200 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Logout
              </button>
            </div>

            <div className={`my-2 h-px ${darkMode ? 'bg-white/8' : 'bg-slate-200'}`} />

            <button
              onClick={() => {
                setIsOpen(false)
                setShowDeletePopup(true)
              }}
              className={`block w-full rounded-[1rem] px-3.5 py-3 text-left text-sm font-medium ${
                darkMode
                  ? 'text-rose-200 hover:bg-rose-500/10'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Delete account
            </button>
          </div>
        </>
      )}

      <DeleteAccountPopup
        isOpen={showDeletePopup}
        onClose={() => setShowDeletePopup(false)}
        onConfirm={handleDeleteAccountConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}
