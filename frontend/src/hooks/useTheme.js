import { useEffect, useState } from 'react';

const THEME_KEY = 'btdat-theme';

export default function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(t => (t === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}
