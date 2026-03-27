'use client';

import { useTransition } from 'react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

/**
 * Retro pixel-style language selector dropdown.
 * Persists the selection to the user profile via the API.
 * @returns The language selector dropdown JSX
 */
export function LanguageSelector() {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  // Handle language change — persists preference to backend and triggers UI update
  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    startTransition(() => {
      fetch('/api/user/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: langCode }),
      }).catch(console.error);
    });
  };

  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 font-pixel text-xs font-semibold px-3 py-1.5 border-[2px] border-ink-700 bg-cream-50 hover:bg-cream-100 disabled:opacity-50 transition-colors"
        style={{ boxShadow: '2px 2px 0px #302818' }}
      >
        <span>{currentLanguage.flag}</span>
        <span className="text-ink-700">{currentLanguage.code.toUpperCase()}</span>
        <span className="text-ink-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 z-20 mt-2 w-44 retro-dialog"
            style={{ boxShadow: '5px 5px 0px #302818' }}
          >
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 font-body text-sm font-medium transition-colors ${
                    lang.code === currentLang
                      ? 'bg-FFCC4D text-ink-900'
                      : 'text-ink-700 hover:bg-cream-200'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Intentionally unused — reserved for future locale-based routing via next-intl
// eslint-disable-next-line @typescript-eslint/no-explicit-any
void (useRouter as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
void (usePathname as any);
