// Email dispatch service for PaceSetter School admin authentication

export interface SentEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  code: string;
  timestamp: string;
  read: boolean;
  method?: string;
  previewUrl?: string;
}

const EMAIL_STORAGE_KEY = 'pacesetter_admin_inbox_v1';
const OTP_STORAGE_KEY = 'pacesetter_current_otp_v1';

export const generateOtpCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveSentEmail = (email: SentEmail) => {
  try {
    const existing = getInboxEmails();
    const updated = [email, ...existing.filter(e => e.id !== email.id).slice(0, 9)];
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
};

export const getInboxEmails = (): SentEmail[] => {
  try {
    const saved = localStorage.getItem(EMAIL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/**
 * Dispatches real OTP email via backend /api/send-otp
 */
export const dispatchAdminOtpEmailAsync = async (targetEmail: string): Promise<SentEmail> => {
  const cleanEmail = targetEmail.trim().toLowerCase();
  let serverCode = '';
  let deliveryMethod = 'server';
  let previewUrl: string | undefined = undefined;

  try {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });

    if (response.ok) {
      const data = await response.json();
      deliveryMethod = data.method || 'smtp';
      previewUrl = data.previewUrl;
      if (data.code) {
        serverCode = data.code;
      }
    } else {
      console.warn('[EmailService] Backend /api/send-otp returned status', response.status);
    }
  } catch (err) {
    console.warn('[EmailService] Network call to /api/send-otp failed, fallback to local generator', err);
  }

  // Fallback random code if server didn't provide one
  const finalCode = serverCode || generateOtpCode();

  const emailRecord: SentEmail = {
    id: `mail-${Date.now()}`,
    from: 'PaceSetter School Security <security@pacesetter.school>',
    to: cleanEmail,
    subject: `Ваш код подтверждения для входа в панель PaceSetter: ${finalCode}`,
    code: finalCode,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    read: false,
    method: deliveryMethod,
    previewUrl,
  };

  try {
    sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify({
      code: finalCode,
      email: cleanEmail,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      method: deliveryMethod,
      previewUrl,
    }));
  } catch {}

  saveSentEmail(emailRecord);

  // Trigger custom window event for real-time notification
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pacesetter_new_email', { detail: emailRecord }));
  }

  return emailRecord;
};

/**
 * Verify OTP via server API or local session fallback
 */
export const verifyOtpCodeAsync = async (targetEmail: string, enteredCode: string): Promise<boolean> => {
  const cleanEmail = targetEmail.trim().toLowerCase();
  const cleanCode = enteredCode.replace(/\s+/g, '').trim();

  // Try server API first
  try {
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        clearOtpSession();
        return true;
      }
    }
  } catch (err) {
    console.warn('[EmailService] Server verify failed, checking session store fallback', err);
  }

  // Fallback to local session check
  const session = getCurrentOtpSession();
  if (session && session.email.toLowerCase() === cleanEmail && session.code === cleanCode) {
    clearOtpSession();
    return true;
  }

  return false;
};

export const getCurrentOtpSession = (): { code: string; email: string; createdAt: number; expiresAt: number; method?: string; previewUrl?: string } | null => {
  try {
    const saved = sessionStorage.getItem(OTP_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(OTP_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearOtpSession = () => {
  try {
    sessionStorage.removeItem(OTP_STORAGE_KEY);
  } catch {}
};
