// src/hooks/useLanguagePersistence.ts
"use client";

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import useUser from '@/utils/useUser';

export default function useLanguagePersistence() {
  const { i18n } = useTranslation();
  const { data: user } = useUser();
  const supabase = createClient();

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      if (user?.id) {
        // Try to get from Supabase profile
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('id', user.id)
            .single();

          if (profile?.preferred_language && profile.preferred_language !== i18n.language) {
            await i18n.changeLanguage(profile.preferred_language);
          }
        } catch (error) {
          console.error('Error loading language preference:', error);
        }
      } else {
        // Load from localStorage for guests
        const savedLang = localStorage.getItem('nexachain_language');
        if (savedLang && savedLang !== i18n.language) {
          await i18n.changeLanguage(savedLang);
        }
      }
    };

    loadLanguage();
  }, [user?.id, i18n, supabase]);

  // Save language when it changes
  useEffect(() => {
    const saveLanguage = async () => {
      const currentLang = i18n.language;

      if (user?.id) {
        // Save to Supabase profile
        try {
          await supabase
            .from('profiles')
            .update({ preferred_language: currentLang })
            .eq('id', user.id);
        } catch (error) {
          console.error('Error saving language preference:', error);
        }
      }

      // Always save to localStorage as backup
      localStorage.setItem('nexachain_language', currentLang);
    };

    saveLanguage();
  }, [i18n.language, user?.id, supabase]);
}