'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePopup } from '@/contexts/PopupContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedRouter } from '@/hooks/useOptimizedRouter';
import { X } from 'lucide-react';
import ModernAuthForm from './ModernAuthForm';

interface AuthPopupProps {
  darkMode?: boolean;
}

export default function AuthPopup({ darkMode = false }: AuthPopupProps) {
  const { isAuthPopupOpen, closeAuthPopup } = usePopup();
  const { user } = useAuth();
  const router = useOptimizedRouter();

  // Close the popup and redirect if user is authenticated
  useEffect(() => {
    if (isAuthPopupOpen && user) {
      closeAuthPopup();
      router.push('/chat');
    }
  }, [isAuthPopupOpen, user, closeAuthPopup, router]);

  return (
    <AnimatePresence>
      {isAuthPopupOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            darkMode ? 'bg-black/80' : 'bg-black/60'
          } backdrop-blur-sm`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthPopup}
        >
          <motion.div
            className={`relative rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
              darkMode 
                ? 'bg-gray-900 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeAuthPopup}
              className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200 ${
                darkMode
                  ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Close authentication popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Auth Form */}
            <div className="p-6 md:p-8">
              <ModernAuthForm darkMode={darkMode} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}