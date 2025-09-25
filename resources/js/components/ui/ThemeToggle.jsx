import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const order = ['light', 'dark', 'system'];

const iconMap = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const labelMap = {
  light: 'Mode Terang',
  dark: 'Mode Gelap',
  system: 'Ikuti Sistem',
};

export default function ThemeToggle({ className = '', ariaLabel, variant = 'default', ...buttonProps }) {
  const { theme, mode, setTheme } = useTheme();
  const Icon = iconMap[theme] || Sun;

  const handleToggle = () => {
    const currentIndex = order.indexOf(theme);
    const nextTheme = order[(currentIndex + 1) % order.length];
    setTheme(nextTheme);
  };

  const baseClass =
    variant === 'icon'
      ? 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-divider/60 bg-card text-primary shadow-sm hover:bg-soft focus:outline-none focus:ring-2 focus:ring-coffee-300 dark:bg-slate-800 dark:text-slate-200'
      : 'inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-divider/60 bg-card text-primary hover:bg-soft transition-all shadow-soft';

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`${baseClass} ${className}`}
      title={`${labelMap[theme]} • Saat ini ${mode === 'dark' ? 'Gelap' : 'Terang'}`}
      aria-label={ariaLabel || 'Ganti tema tampilan'}
      {...buttonProps}
    >
      <Icon className="h-4 w-4" />
      {variant !== 'icon' && (
        <span className="text-xs font-semibold tracking-wide hidden sm:inline">
          {labelMap[theme]}
        </span>
      )}
    </button>
  );
}
