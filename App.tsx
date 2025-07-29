import React, { useState } from 'react';
import Announcement from './components/Announcement';
import RsvpForm from './components/RsvpForm';
import CheckAttendance from './components/CheckAttendance';
import { SchoolLogoIcon } from './components/icons/SchoolLogoIcon';
import { content } from './i18n';
import type { Lang } from './types';
import { LOGO_URL } from './constants';

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>('th');
  const [logoError, setLogoError] = useState(false);
  const t = content[lang];

  const showFallbackLogo = logoError || !LOGO_URL || LOGO_URL.includes('https://placehold.co');

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800 antialiased">
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <div className="flex rounded-md shadow-sm bg-white border border-gray-300">
            <button
              onClick={() => setLang('th')}
              aria-pressed={lang === 'th'}
              className={`px-4 py-2 text-sm font-medium rounded-l-md transition-colors ${lang === 'th' ? 'bg-[#1A237E] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              ไทย
            </button>
            <button
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              className={`px-4 py-2 text-sm font-medium rounded-r-md transition-colors ${lang === 'en' ? 'bg-[#1A237E] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              English
            </button>
          </div>
        </div>
        
        <header className="flex flex-col items-center text-center mb-8">
          {showFallbackLogo ? (
            <SchoolLogoIcon className="w-24 h-24 sm:w-32 sm:h-32 mb-4 text-[#1A237E]" />
          ) : (
            <img 
              src={LOGO_URL} 
              alt={t.header.schoolName}
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain mb-4"
              onError={() => setLogoError(true)}
              crossOrigin="anonymous"
            />
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A237E]">
              {t.header.schoolName}
            </h1>
            <p className="text-lg md:text-xl text-gray-600">{t.header.subTitle}</p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          <Announcement lang={lang} />
          <RsvpForm lang={lang} />
          <CheckAttendance lang={lang} />
        </div>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>&copy; 2025 Satit Udomseuksa School. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;