// src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { translations, Translations } from '../i18n/translations';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<string>('en'); // Default to English

    const t = translations[language] || translations.en;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};