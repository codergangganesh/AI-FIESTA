'use client'

import React from 'react'
import Image from 'next/image'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface EnhancedAuthLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function EnhancedAuthLogo({
  size = 'md',
  className = ''
}: EnhancedAuthLogoProps) {
  const { darkMode } = useDarkMode()

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const dimSizes = {
    sm: 40,
    md: 48,
    lg: 64,
    xl: 80
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center rounded-full overflow-hidden`}>
      <Image
        src="/logo.png"
        alt="AI Fiesta Auth Logo"
        width={dimSizes[size]}
        height={dimSizes[size]}
        className="object-contain"
        priority
      />
    </div>
  )
}