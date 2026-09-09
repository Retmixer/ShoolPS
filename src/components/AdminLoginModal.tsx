import React, { useState, useEffect } from 'react';
import { useCourses } from '../context/CoursesContext';
import {
  Lock,
  KeyRound,
  Mail,
  AlertCircle,
  X,
  LogIn
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginAdmin, adminLoginError } = useCourses();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset fields when opened
  useEffect(() => {
    if (isOpen) {
      setLogin('');
      setPassword('');
      setLocalError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanEmail = login.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setLocalError('Введите адрес электронной почты.');
      return;
    }

    if (!cleanPassword) {
      setLocalError('Введите пароль.');
      return;
    }

    setIsSubmitting(true);
    const success = loginAdmin(cleanEmail, cleanPassword);
    setIsSubmitting(false);

    if (success) {
      onSuccess();
      onClose();
    } else {
      setLocalError(adminLoginError || 'Неверный email или пароль.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-2xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          id="admin-modal-close-btn"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-white text-black shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight font-mono">
              Вход для администратора
            </h2>
            <p className="text-xs font-mono text-neutral-400">
              PaceSetter School • Управление курсами
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5">
              Email администратора:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                id="admin-email-input"
                required
                autoFocus
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Введите email"
                className="w-full pl-9 pr-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white font-mono min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5">
              Пароль:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                id="admin-password-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full pl-9 pr-3 py-2.5 bg-black border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white font-mono min-h-[44px]"
              />
            </div>
          </div>

          {(localError || adminLoginError) && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg flex items-center gap-2 text-xs font-mono text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{localError || adminLoginError}</span>
            </div>
          )}

          <button
            type="submit"
            id="admin-submit-login-btn"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-white text-black font-semibold text-sm rounded-lg hover:bg-neutral-200 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2 min-h-[44px]"
          >
            <LogIn className="w-4 h-4" />
            <span>Войти</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
