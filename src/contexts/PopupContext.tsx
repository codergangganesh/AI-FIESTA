'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'

interface PopupContextType {
  openPaymentPopup: () => void
  closePaymentPopup: () => void
  isPaymentPopupOpen: boolean
  openAuthPopup: () => void
  closeAuthPopup: () => void
  isAuthPopupOpen: boolean
}

const PopupContext = createContext<PopupContextType | undefined>(undefined)

export function PopupProvider({ children }: { children: ReactNode }) {
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false)
    const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false)

  const openPaymentPopup = () => {
    setIsPaymentPopupOpen(true)
  }

  const closePaymentPopup = () => {
    setIsPaymentPopupOpen(false)
  }

  const openAuthPopup = () => {
    setIsAuthPopupOpen(true)
  }

  const closeAuthPopup = () => {
    setIsAuthPopupOpen(false)
  }

  const value = {
    openPaymentPopup,
    closePaymentPopup,
    isPaymentPopupOpen,
    openAuthPopup,
    closeAuthPopup,
    isAuthPopupOpen
  }

  return (
    <PopupContext.Provider value={value}>
      {children}
    </PopupContext.Provider>
  )
}

export function usePopup() {
  const context = useContext(PopupContext)
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider')
  }
  return context
}