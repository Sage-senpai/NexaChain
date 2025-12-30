// src/components/TranslationProvider.tsx - FIXED VERSION
"use client";

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/config';

export default function TranslationProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simple initialization check
    const initI18n = async () => {
      try {
        // Wait for i18n to be ready
        if (!i18n.isInitialized) {
          await i18n.init();
        }
        
        // Small delay to ensure translations are loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsReady(true);
      } catch (error) {
        console.error('i18n initialization error:', error);
        // Still set ready to prevent infinite loading
        setIsReady(true);
      }
    };

    initI18n();
  }, []);

  // Simple loading screen
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#D4AF37] font-semibold text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}