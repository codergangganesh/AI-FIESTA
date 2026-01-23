'use client'

import React from 'react'
import Image from 'next/image'

interface AIFiestaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  darkMode?: boolean
  simplified?: boolean
}

export default function AIFiestaLogo({
  size = 'md',
  className = '',
  darkMode = false,
  simplified = false
}: AIFiestaLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const dimSizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center rounded-full overflow-hidden`}>
      <Image
        src="/logo-new.png"
        alt="AI Fiesta Logo"
        width={dimSizes[size]}
        height={dimSizes[size]}
        className="object-contain"
        priority
      />
    </div>
  )
}