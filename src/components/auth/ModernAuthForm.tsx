'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useOptimizedRouter } from '@/hooks/useOptimizedRouter'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Github } from 'lucide-react'
import EnhancedAuthLogo from '@/components/auth/EnhancedAuthLogo'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface ModernAuthFormProps {
  darkMode?: boolean;
}

export default function ModernAuthForm({ darkMode: propDarkMode }: ModernAuthFormProps = {}) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { signIn, signUp, signInWithGoogle, signInWithGithub } = useAuth()
  const router = useOptimizedRouter()
  const searchParams = useSearchParams()
  const contextDarkMode = useDarkMode()
  const darkMode = propDarkMode !== undefined ? propDarkMode : contextDarkMode.darkMode

  // Check for success message from URL params
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(decodeURIComponent(message))
      // Clear the message from URL after displaying
      window.history.replaceState({}, document.title, '/auth')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          setError(error.message)
        } else {
          router.push('/chat')
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        
        const { error } = await signUp(formData.email, formData.password)
        if (error) {
          setError(error.message)
        } else {
          // After successful signup, reset form and show success message
          setFormData({
            email: '',
            password: '',
            confirmPassword: ''
          })
          setIsLogin(true)
          setSuccessMessage('Account created successfully. Please sign in.')
        }
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccessMessage('')
      await signInWithGoogle()
    } catch {
      setError('Failed to sign in with Google. Please try again.')
      setLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccessMessage('')
      await signInWithGithub()
    } catch {
      setError('Failed to sign in with GitHub. Please try again.')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <EnhancedAuthLogo className="w-16 h-16" />
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {isLogin 
            ? 'Sign in to continue your AI journey'
            : 'Create an account to get started'
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/30 border border-green-700/50 text-green-300' : 'bg-green-100 border border-green-200 text-green-700'}`}>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/30 border border-red-700/50 text-red-300' : 'bg-red-100 border border-red-200 text-red-700'}`}>
            {error}
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className={`w-full pl-10 pr-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field - Only for Signup */}
        {!isLogin && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 font-medium rounded-lg transition-colors duration-200 ${
            darkMode 
              ? 'bg-orange-600 hover:bg-orange-700 text-white' 
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-300'}`} />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className={`px-2 ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'}`}>
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200' 
                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
            } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleGithubSignIn}
            disabled={loading}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200' 
                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
            } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            <Github className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <span>GitHub</span>
          </button>
        </div>

        {/* Toggle Login/Signup */}
        <div className="text-center pt-4">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setSuccessMessage('')
              }}
              className={`font-medium ml-1 ${darkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'}`}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </form>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
