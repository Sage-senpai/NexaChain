// src/components/LanguageWrapper.tsx
"use client";

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface LanguageWrapperProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showOnMobile?: boolean;
}

export default function LanguageWrapper({ 
  children, 
  position = 'top-right',
  showOnMobile = true 
}: LanguageWrapperProps) {
  const { i18n } = useTranslation();

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className="relative">
      {children}
      <div 
        className={`fixed ${positionClasses[position]} z-50 ${!showOnMobile ? 'hidden sm:block' : ''}`}
      >
        <LanguageSwitcher />
      </div>
    </div>
  );
}