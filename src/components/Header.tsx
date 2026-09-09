import React from 'react';
import { useCourses } from '../context/CoursesContext';
import { Shield, BookOpen, Sparkles } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  onOpenAdminLogin: () => void;
  onOpenAdminPanel: () => void;
  currentView: 'home' | 'course' | 'admin';
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onOpenAdminLogin,
  onOpenAdminPanel,
  currentView,
}) => {
  const { isAdmin } = useCourses();

  return (
    <header className="w-full bg-black/95 backdrop-blur-md border-b border-neutral-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer min-w-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white text-black flex items-center justify-center font-black font-mono tracking-tighter text-xs sm:text-sm group-hover:scale-105 transition-transform shadow-md shrink-0">
            PS
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold tracking-tight text-sm sm:text-base text-white flex items-center gap-1.5 font-mono truncate">
              <span className="truncate">PaceSetter School</span>
              <span className="hidden xs:inline text-neutral-600 font-normal">/</span>
              <span className="hidden xs:inline text-[11px] sm:text-xs text-neutral-400 font-medium whitespace-nowrap">1С &amp; AI</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 tracking-wider truncate">
              ОНЛАЙН КУРСЫ ПО 1С И AI
            </span>
          </div>
        </button>

        {/* Navigation / Admin button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentView !== 'home' && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer min-h-[38px]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Каталог курсов</span>
              <span className="sm:hidden">Курсы</span>
            </button>
          )}

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                id="header-admin-panel-btn"
                onClick={onOpenAdminPanel}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-all cursor-pointer shadow-sm font-mono min-h-[38px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                <span className="hidden sm:inline">Панель управления</span>
                <span className="sm:hidden">Админка</span>
              </button>
            </div>
          ) : (
            <button
              id="header-admin-login-btn"
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer min-h-[38px]"
            >
              <Shield className="w-3.5 h-3.5 text-neutral-400" />
              <span>Вход</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
