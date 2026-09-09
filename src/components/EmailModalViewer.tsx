import React from 'react';
import { Mail, X, Copy, Check, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { SentEmail } from '../utils/emailService';

interface EmailModalViewerProps {
  email: SentEmail | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyCode?: (code: string) => void;
}

export const EmailModalViewer: React.FC<EmailModalViewerProps> = ({
  email,
  isOpen,
  onClose,
  onApplyCode,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !email) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(email.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyCode) {
      onApplyCode(email.code);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Email Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
            <Mail className="w-4 h-4 text-white" />
            <span className="font-semibold text-white">Входящее сообщение</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300 truncate max-w-[160px] sm:max-w-xs">{email.to}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Metadata */}
        <div className="px-4 sm:px-6 py-3 border-b border-neutral-800/80 bg-neutral-950/60 text-xs font-mono space-y-1.5">
          <div className="flex items-baseline justify-between text-neutral-400">
            <span className="text-neutral-500">От:</span>
            <span className="text-white font-medium">{email.from}</span>
          </div>
          <div className="flex items-baseline justify-between text-neutral-400">
            <span className="text-neutral-500">Кому:</span>
            <span className="text-neutral-200">{email.to}</span>
          </div>
          <div className="flex items-baseline justify-between text-neutral-400">
            <span className="text-neutral-500">Время:</span>
            <span className="flex items-center gap-1 text-neutral-400">
              <Clock className="w-3 h-3" />
              {email.timestamp}
            </span>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-5 sm:p-6 space-y-5 bg-neutral-950 text-neutral-300 text-sm">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              {email.subject}
            </h3>
            <p className="text-xs text-neutral-400">
              Выполнен запрос на авторизацию в панели управления PaceSetter School.
            </p>
          </div>

          {/* Verification Code Display */}
          <div className="p-4 sm:p-5 rounded-xl border border-neutral-800 bg-neutral-900/70 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
              Ваш код подтверждения
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-white select-all bg-black/60 px-6 py-2.5 rounded-lg border border-neutral-800">
              {email.code}
            </div>
            <span className="text-[11px] font-mono text-neutral-500 mt-2">
              Код действителен в течение 10 минут. Никому не сообщайте этот код.
            </span>
          </div>

          <div className="text-xs text-neutral-400 space-y-1 bg-neutral-900/30 p-3 rounded-lg border border-neutral-800/50 font-mono">
            <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Двухфакторная защита аккаунта</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Если это были не вы, немедленно смените пароль учетной записи PaceSetter School.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 px-4 sm:px-6 py-4 border-t border-neutral-800 bg-neutral-900/60">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Код скопирован' : 'Скопировать код'}</span>
          </button>

          {onApplyCode && (
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-white text-black font-semibold text-xs font-mono rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
            >
              <span>Вставить в форму</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
