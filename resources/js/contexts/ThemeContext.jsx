import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = 'staffin.theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

const resolveSystemPreference = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return THEMES.LIGHT;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
};

const normalizeTheme = (value) => {
  if (!value) return THEMES.SYSTEM;
  if ([THEMES.LIGHT, THEMES.DARK, THEMES.SYSTEM].includes(value)) {
    return value;
  }
  return THEMES.SYSTEM;
};

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => {
    if (typeof window === 'undefined') return THEMES.SYSTEM;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return normalizeTheme(stored);
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (preference === THEMES.SYSTEM) {
      return resolveSystemPreference();
    }
    return preference;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyTheme = (value) => {
      const html = document.documentElement;
      html.dataset.theme = value;
      html.style.setProperty('color-scheme', value === THEMES.DARK ? 'dark' : 'light');
    };

    const update = () => {
      const effective = preference === THEMES.SYSTEM ? resolveSystemPreference() : preference;
      setResolvedTheme(effective);
      applyTheme(effective);
    };

    update();
  }, [preference]);

  useEffect(() => {
    if (typeof window === 'undefined' || preference !== THEMES.SYSTEM) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      setResolvedTheme(media.matches ? THEMES.DARK : THEMES.LIGHT);
      document.documentElement.dataset.theme = media.matches ? THEMES.DARK : THEMES.LIGHT;
      document.documentElement.style.setProperty('color-scheme', media.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [preference]);

  const value = useMemo(() => ({
    theme: preference,
    mode: resolvedTheme,
    THEMES,
    setTheme: (value) => {
      const normalized = normalizeTheme(value);
      setPreference(normalized);
      if (typeof window !== 'undefined') {
        if (normalized === THEMES.SYSTEM) {
          window.localStorage.removeItem(STORAGE_KEY);
        } else {
          window.localStorage.setItem(STORAGE_KEY, normalized);
        }
      }
    },
    toggleTheme: () => {
      setPreference((prev) => {
        const next = prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, next);
        }
        return next;
      });
    },
  }), [preference, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
