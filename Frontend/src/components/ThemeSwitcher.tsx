import React, { useEffect, useState } from 'react';

const THEME_KEY = 'theme_preference';

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <button
      className={`px-3 py-1 rounded border font-medium transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
};

export default ThemeSwitcher; 