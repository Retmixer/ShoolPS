import React from 'react';
import { Shield } from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin: () => void;
  isAdmin: boolean;
  onOpenAdminPanel: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdminLogin,
  isAdmin,
  onOpenAdminPanel,
}) => {
  return (
    <footer className="w-full border-t border-neutral-900 bg-black text-neutral-400 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 font-mono text-white text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>PaceSetter School</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Онлайн курсы по 1С и AI: практические видеоуроки на Google Диске и интерактивные домашние задания.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-mono">
          <span className="text-neutral-500 text-center">
            Платформа дистанционного обучения
          </span>

          {isAdmin ? (
            <button
              onClick={onOpenAdminPanel}
              className="text-white hover:underline flex items-center gap-1.5 cursor-pointer min-h-[40px] px-2"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Панель управления</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px] px-2"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Вход</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-neutral-900 text-center text-[11px] font-mono text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} PaceSetter School. Все права защищены.</span>
        <span>Онлайн курсы по 1С и AI</span>
      </div>
    </footer>
  );
};

