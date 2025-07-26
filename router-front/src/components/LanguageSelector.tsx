// src/components/LanguageSelector.tsx
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSelector.scss';

const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="language-selector">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="language-dropdown"
            >
                <option value="en">🇺🇸 English</option>
                <option value="tr">🇹🇷 Türkçe</option>
            </select>
        </div>
    );
};

export default LanguageSelector;