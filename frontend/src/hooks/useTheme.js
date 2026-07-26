import { useEffect, useState } from 'react';

const THEME_KEY = 'btdat-theme';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * Theme hook with:
 * - Auto-detection of system preference on first visit
 * - Manual toggle stored in localStorage
 * - System preference change listener
 */
export default function useTheme() {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored || getSystemTheme();
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e) => {
      // Only follow system if user hasn't manually set theme
      if (!localStorage.getItem(THEME_KEY)) {
        setThemeState(e.matches ? 'light' : 'dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    setThemeState(t => (t === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}
