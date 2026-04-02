'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useOptimizedRouter } from '@/hooks/useOptimizedRouter'
import OptimizedPageTransitionLoader from '@/components/ui/OptimizedPageTransitionLoader'
import { useOptimizedLoading } from '@/contexts/OptimizedLoadingContext'
import EnhancedAuthLogo from '@/components/auth/EnhancedAuthLogo'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { usePopup } from '@/contexts/PopupContext'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useOptimizedRouter()
  const { setPageLoading } = useOptimizedLoading()
  const { darkMode } = useDarkMode()
  const { openAuthPopup } = usePopup()

  // Redirect authenticated users to chat
  useEffect(() => {
    if (user) {
      setPageLoading(true, "Redirecting to chat...");
      router.push('/chat')
    } else if (!user && !loading) {
      setPageLoading(false);
    }
  }, [user, router, loading, setPageLoading])

  // Redirect to popup and back to home
  useEffect(() => {
    if (!loading && !user) {
      openAuthPopup();
      router.push('/');
    }
  }, [loading, user, openAuthPopup, router]);

  // Show loading while checking auth status
  if (loading) {
    return <OptimizedPageTransitionLoader message="Loading authentication..." />;
  }

  if (user) {
    return null // or a loading spinner while redirecting
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Simplified background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 to-gray-50'}`}></div>
      </div>

      {/* Simplified auth form container */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className={`rounded-2xl shadow-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <EnhancedAuthLogo size="lg" />
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Fiesta
              </h1>
            </div>
            
            <Link 
              href="/" 
              className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Back to Home
            </Link>
          </div>

          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Opening authentication popup...
            </p>
          </div>
        </div>
      </div>
      
    </div>
  )
}
