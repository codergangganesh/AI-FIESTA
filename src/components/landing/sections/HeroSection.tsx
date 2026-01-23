'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, Sparkles, Cpu, MessageSquare, Infinity, Zap, Brain, Palette, Send } from 'lucide-react'
import { ChatInput } from '@/components/ui/bolt-style-chat'
import ScrollReveal from '@/components/ui/scroll-reveal'
import { useAuth } from '@/contexts/AuthContext'
import { usePopup } from '@/contexts/PopupContext'
import { useOptimizedRouter } from '@/hooks/useOptimizedRouter'
import { useDarkMode } from '@/contexts/DarkModeContext'
import AIFiestaLogo from '../AIFiestaLogo'
import { AVAILABLE_MODELS } from '@/lib/models'

interface HeroSectionProps {
  darkMode: boolean
  handleGetStarted: () => void
  handleGoToChat: () => void
  user: { email?: string; user_metadata?: { full_name?: string } } | null
}

export default function HeroSection({
  darkMode,
  handleGetStarted,
  handleGoToChat,
  user
}: HeroSectionProps) {
  // Determine which handler to use based on authentication status
  const { openAuthPopup } = usePopup();
  const router = useOptimizedRouter();
  const { toggleDarkMode } = useDarkMode();
  const [testInput, setTestInput] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(() => {
    if (!AVAILABLE_MODELS || AVAILABLE_MODELS.length === 0) return [];
    return AVAILABLE_MODELS.slice(0, 2).map(m => m.id);
  });
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const handleAuthPopup = () => {
    if (user) {
      router.push('/chat');
    } else {
      openAuthPopup();
    }
  };

  const handleClick = () => {
    if (user) {
      handleGoToChat();
    } else {
      handleGetStarted();
    }
  };

  const handleTestSubmit = () => {
    if (testInput.trim()) {
      // Store message and selected models in localStorage for persistence across auth flow
      localStorage.setItem('pendingMessage', testInput.trim());
      localStorage.setItem('pendingModels', JSON.stringify(selectedModels));

      if (user) {
        // User is authenticated, go directly to chat
        router.push('/chat');
      } else {
        // User not authenticated, open auth popup
        // After successful auth, AuthPopup will redirect to chat
        openAuthPopup();
      }
    }
  };

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => {
      const isSelected = prev.includes(modelId);
      if (isSelected) {
        // Don't allow deselecting if it's the last model
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== modelId);
      }
      // Enforce max 3 models
      if (prev.length >= 3) return prev;
      return [...prev, modelId];
    });
  };

  return (
    <section className="relative pt-20 pb-32">
      {/* Enhanced Background Elements */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Enhanced Badge with 3D effect */}
          <ScrollReveal>
            <div
              onClick={handleClick}
              className={`inline-flex items-center space-x-2 backdrop-blur-xl rounded-full px-5 py-2.5 mb-8 relative overflow-hidden transition-all duration-300 transform hover:scale-105 cursor-pointer ${darkMode
                ? 'bg-gray-800/60 border border-gray-700/50 shadow-2xl shadow-violet-500/20'
                : 'bg-white/70 border border-slate-200/50 shadow-2xl shadow-blue-500/20'
                }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              <Sparkles className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Compare 9+ Premium AI Models
              </span>
            </div>
          </ScrollReveal>

          {/* Enhanced Title with 3D effect and gradient animation */}
          <div className="mb-8">
            <ScrollReveal delay={0.2}>
              <h1
                onClick={handleClick}
                className="text-5xl sm:text-6xl lg:text-7xl font-black mb-4 cursor-pointer"
              >
                <span className={`block bg-gradient-to-r transition-all duration-500 ${darkMode
                  ? 'from-white via-blue-200 to-purple-200'
                  : 'from-slate-900 via-blue-800 to-purple-800'
                  } bg-clip-text text-transparent hover:from-blue-200 hover:via-purple-200 hover:to-pink-200`}>
                  AI Model
                </span>
                <span className={`block bg-gradient-to-r transition-all duration-500 ${darkMode
                  ? 'from-blue-400 via-purple-400 to-pink-400'
                  : 'from-blue-600 via-purple-600 to-pink-600'
                  } bg-clip-text text-transparent hover:from-blue-500 hover:via-purple-500 hover:to-pink-500`}>
                  Comparison
                </span>
                <span className={`block bg-gradient-to-r transition-all duration-500 ${darkMode
                  ? 'from-white to-gray-300'
                  : 'from-slate-900 to-slate-700'
                  } bg-clip-text text-transparent hover:from-blue-200 hover:to-purple-200`}>
                  Made Simple
                </span>
              </h1>
            </ScrollReveal>

            {/* Subtitle with animated underline */}
            <ScrollReveal delay={0.3}>
              <div
                onClick={handleClick}
                className="relative inline-block cursor-pointer"
              >
                <h2 className={`text-2xl sm:text-3xl font-bold mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-200'
                  }`}>
                  Unleash the Power of AI
                </h2>
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 rounded-full ${darkMode
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gradient-to-r from-blue-400 to-purple-400'
                  }`}></div>
              </div>
            </ScrollReveal>
          </div>

          {/* Enhanced Description with Highlight */}
          <ScrollReveal delay={0.4}>
            <div
              onClick={handleClick}
              className={`text-xl sm:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed cursor-pointer ${darkMode ? 'text-gray-300' : 'text-slate-600'
                }`}
            >
              <p>
                Send one message to multiple AI models and compare their responses instantly.
                <span className={`font-bold mx-2 px-2 py-1 rounded-lg ${darkMode
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300'
                  : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
                  }`}>
                  Find the perfect AI
                </span>
                for every task.
              </p>
            </div>
          </ScrollReveal>


          {/* Test Input Area - Matching Reference Image */}
          <div className="mb-12 max-w-5xl mx-auto relative z-50">
            <ChatInput
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onSend={handleTestSubmit}
              selectedModels={selectedModels}
              onModelToggle={handleModelToggle}
              availableModels={AVAILABLE_MODELS.map(m => ({
                id: m.id,
                name: m.label,
                description: m.description,
                provider: m.provider,
                badge: m.provider === 'Anthropic' ? 'Pro' : undefined
              }))}
            />
          </div>

          {/* Enhanced CTA Buttons */}


          {/* Enhanced Stats with Card Design */}
          <ScrollReveal delay={0.6}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div
                onClick={handleClick}
                className={`group text-center p-6 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:scale-105 relative overflow-hidden transform hover:-translate-y-2 cursor-pointer ${darkMode
                  ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-xl shadow-violet-500/10'
                  : 'bg-white/70 border-slate-200/50 hover:bg-white/90 shadow-xl shadow-blue-500/10'
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className={`w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 relative z-10 shadow-lg ${darkMode ? 'shadow-blue-500/30' : 'shadow-blue-500/30'
                  }`}>
                  <Cpu className="w-7 h-7 text-white" />
                </div>
                <div className={`text-3xl font-extrabold mb-2 relative z-10 ${darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                  9+
                </div>
                <div className={`text-sm font-semibold relative z-10 ${darkMode ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                  AI Models
                </div>
              </div>
              <div
                onClick={handleClick}
                className={`group text-center p-6 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:scale-105 relative overflow-hidden transform hover:-translate-y-2 cursor-pointer ${darkMode
                  ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-xl shadow-violet-500/10'
                  : 'bg-white/70 border-slate-200/50 hover:bg-white/90 shadow-xl shadow-blue-500/10'
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className={`w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 relative z-10 shadow-lg ${darkMode ? 'shadow-green-500/30' : 'shadow-green-500/30'
                  }`}>
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <div className={`text-3xl font-extrabold mb-2 relative z-10 ${darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                  1
                </div>
                <div className={`text-sm font-semibold relative z-10 ${darkMode ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                  Universal Input
                </div>
              </div>
              <div
                onClick={handleClick}
                className={`group text-center p-6 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:scale-105 relative overflow-hidden transform hover:-translate-y-2 cursor-pointer ${darkMode
                  ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-xl shadow-violet-500/10'
                  : 'bg-white/70 border-slate-200/50 hover:bg-white/90 shadow-xl shadow-blue-500/10'
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className={`w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4 relative z-10 shadow-lg ${darkMode ? 'shadow-pink-500/30' : 'shadow-pink-500/30'
                  }`}>
                  <Infinity className="w-7 h-7 text-white" />
                </div>
                <div className={`text-3xl font-extrabold mb-2 relative z-10 ${darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                  ∞
                </div>
                <div className={`text-sm font-semibold relative z-10 ${darkMode ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                  Comparisons
                </div>
              </div>
              <div
                onClick={handleClick}
                className={`group text-center p-6 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:scale-105 relative overflow-hidden transform hover:-translate-y-2 cursor-pointer ${darkMode
                  ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-xl shadow-violet-500/10'
                  : 'bg-white/70 border-slate-200/50 hover:bg-white/90 shadow-xl shadow-blue-500/10'
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className={`w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 relative z-10 shadow-lg ${darkMode ? 'shadow-orange-500/30' : 'shadow-orange-500/30'
                  }`}>
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className={`text-3xl font-extrabold mb-2 relative z-10 ${darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                  0.5s
                </div>
                <div className={`text-sm font-semibold relative z-10 ${darkMode ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                  Avg Response
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) translateX(10px) rotate(5deg);
          }
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
        }
        
        @keyframes float-delayed {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) translateX(-10px) rotate(-5deg);
          }
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
        }
        
        @keyframes float-opposite {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) translateX(-15px) rotate(-3deg);
          }
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
        }
        
        @keyframes float-delayed-opposite {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) translateX(15px) rotate(3deg);
          }
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-float-opposite {
          animation: float-opposite 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-float-delayed-opposite {
          animation: float-delayed-opposite 6s ease-in-out infinite;
          animation-delay: 3s;
        }
      `}</style>
    </section>
  )
}