import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, X, Copy, Check } from 'lucide-react';
import { SentEmail } from '../utils/emailService';

interface EmailNotificationToastProps {
  onOpenViewer: (email: SentEmail) => void;
  onQuickApplyCode?: (code: string) => void;
}

export const EmailNotificationToast: React.FC<EmailNotificationToastProps> = ({
  onOpenViewer,
  onQuickApplyCode,
}) => {
  const [currentEmail, setCurrentEmail] = useState<SentEmail | null>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleNewEmail = (e: CustomEvent<SentEmail>) => {
      setCurrentEmail(e.detail);
      setVisible(true);
      setCopied(false);
    };

    window.addEventListener('pacesetter_new_email' as any, handleNewEmail);
    return () => {
      window.removeEventListener('pacesetter_new_email' as any, handleNewEmail);
    };
  }, []);

  if (!visible || !currentEmail) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentEmail.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickInsert = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickApplyCode) {
      onQuickApplyCode(currentEmail.code);
    }
    setVisible(false);
  };

  return (
    <div className="fixed top-20 right-3 sm:right-6 z-50 max-w-sm w-[calc(100vw-24px)] sm:w-96 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="p-4 rounded-xl border border-neutral-700 bg-neutral-900/95 backdrop-blur-md shadow-2xl text-white space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">Входящее письмо</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400 truncate">{currentEmail.to}</span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-neutral-400 hover:text-white transition-colors p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div>
          <p className="text-xs text-neutral-300 font-medium line-clamp-1">
            {currentEmail.subject}
          </p>
          <div className="mt-2 flex items-center justify-between bg-black/60 px-3 py-2 rounded-lg border border-neutral-800">
            <span className="text-xs font-mono text-neutral-400">Код:</span>
            <span className="text-lg font-mono font-bold tracking-widest text-white">
              {currentEmail.code}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Скопировать код"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={() => {
              onOpenViewer(currentEmail);
              setVisible(false);
            }}
            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-200 rounded-md transition-colors cursor-pointer"
          >
            Открыть письмо
          </button>
          {onQuickApplyCode && (
            <button
              onClick={handleQuickInsert}
              className="px-2.5 py-1.5 bg-white text-black font-semibold text-xs font-mono rounded-md hover:bg-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Вставить</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
