import React from 'react';
import { Calendar, Clock, Star, Users, Briefcase } from 'lucide-react';

const BACKGROUND_ICONS = [
  { icon: Calendar, className: 'top-16 left-8 opacity-25 hidden sm:block', size: 34 },
  { icon: Clock, className: 'top-24 right-12 opacity-25 hidden sm:block', size: 40 },
  { icon: Users, className: 'bottom-24 left-14 opacity-20 hidden md:block', size: 42 },
  { icon: Briefcase, className: 'bottom-16 right-8 opacity-25 hidden sm:block', size: 38 },
  { icon: Star, className: 'top-1/3 right-1/4 opacity-20 hidden lg:block', size: 52 },
];

export default function AuthLayout({ title = 'Selamat Datang di Staffin', subtitle, children }) {
  return (
    <div className="min-h-[100svh] w-full bg-[#FEF5E6] flex items-center justify-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8EE] via-transparent to-[#FFE6CA]" />
        {BACKGROUND_ICONS.map(({ icon: Icon, className, size }, index) => (
          <Icon
            key={index}
            size={size}
            className={`absolute text-[#D9BFA4] ${className}`}
          />
        ))}
        <div className="absolute -top-32 -left-24 w-64 h-64 bg-[#F8E9D6] rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-32 -right-20 w-72 h-72 bg-[#F4DEC4] rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative w-full max-w-[520px] sm:max-w-[560px] px-2">
        <div className="relative bg-white/95 backdrop-blur-sm border border-[#F1E0CA] shadow-[0_20px_55px_-24px_rgba(166,119,77,0.35)] rounded-[32px] px-5 sm:px-9 py-8 sm:py-11 transition-all">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#D9A979] to-[#A6774D] flex items-center justify-center shadow-[0_12px_25px_-12px_rgba(166,119,77,0.6)]">
              <span className="text-white text-2xl font-bold font-display">S</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#3C2A21] font-display tracking-tight leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm sm:text-base text-[#7A675B] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="bg-[#FFF6EA] border border-[#F2E4D2] rounded-3xl px-4 sm:px-6 py-6 sm:py-8 shadow-[inset_0_2px_10px_rgba(255,255,255,0.55)] transition-all">
            {children}
          </div>

          <div className="mt-8 text-center text-xs text-[#8F8076]">
            &copy; {new Date().getFullYear()} Staffin. Semua hak cipta dilindungi.
          </div>
        </div>
      </div>
    </div>
  );
}
