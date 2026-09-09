import express from 'express';
import path from 'path';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory OTP storage
interface OtpRecord {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
  method: string;
  previewUrl?: string;
  timestamp: string;
}

const otpStore = new Map<string, OtpRecord>();

// Helper to clean up expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of otpStore.entries()) {
    if (now > val.expiresAt) {
      otpStore.delete(key);
    }
  }
}, 60 * 1000);

// Generate 6-digit random numeric code
function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send real email via configured transport or Ethereal test inbox
async function sendRealEmail(toEmail: string, code: string): Promise<{ success: boolean; method: string; previewUrl?: string; error?: string }> {
  const subject = `Ваш код подтверждения для входа в PaceSetter School: ${code}`;
  
  const textContent = `PaceSetter School - Двухфакторная авторизация\n\n` +
    `Ваш одноразовый проверочный код: ${code}\n\n` +
    `Код действителен в течение 10 минут.\n` +
    `Если вы не запрашивали этот код, проигнорируйте данное сообщение.\n\n` +
    `Служба безопасности PaceSetter School`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #ededed;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0a0a0a; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="560px" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #111111; border: 1px solid #262626; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background-color: #171717; border-bottom: 1px solid #262626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="font-size: 16px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                    <span style="display: inline-block; width: 10px; height: 10px; background-color: #ffffff; border-radius: 50%; margin-right: 8px;"></span>
                    PaceSetter School
                  </td>
                  <td align="right" style="font-size: 11px; font-family: monospace; color: #737373;">
                    1С &amp; AI КУРСЫ
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Подтверждение входа администратора
              </h1>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
                Выполнен запрос на вход в панель управления для учетной записи <strong style="color: #ffffff;">${toEmail}</strong>.
              </p>

              <!-- Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0; background-color: #050505; border: 1px solid #333333; border-radius: 12px;">
                <tr>
                  <td align="center" style="padding: 24px 20px;">
                    <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 1.5px; color: #737373; margin-bottom: 8px;">
                      Одноразовый код проверки
                    </div>
                    <div style="font-size: 38px; font-weight: 900; font-family: monospace; letter-spacing: 8px; color: #ffffff;">
                      ${code}
                    </div>
                    <div style="font-size: 11px; font-family: monospace; color: #525252; margin-top: 8px;">
                      Срок действия: 10 минут
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; font-size: 12px; line-height: 1.5; color: #737373;">
                Никому не передавайте этот код. Администрация PaceSetter School никогда не запрашивает ваш код в мессенджерах.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0a0a0a; border-top: 1px solid #1f1f1f; font-size: 11px; font-family: monospace; color: #525252;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left">
                    © ${new Date().getFullYear()} PaceSetter School
                  </td>
                  <td align="right">
                    Security 2FA Service
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // 1. Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'PaceSetter School <onboarding@resend.dev>',
          to: [toEmail],
          subject,
          html: htmlContent,
          text: textContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Email] Sent successfully via Resend API:', data);
        return { success: true, method: 'resend' };
      } else {
        const errText = await response.text();
        console.warn('[Email] Resend API error, falling back:', errText);
      }
    } catch (e: any) {
      console.warn('[Email] Resend failed:', e.message);
    }
  }

  // 2. Gmail SMTP
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"PaceSetter School" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log('[Email] Sent successfully via Gmail SMTP to', toEmail);
      return { success: true, method: 'gmail' };
    } catch (e: any) {
      console.warn('[Email] Gmail SMTP failed:', e.message);
    }
  }

  // 3. Custom SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = Number(process.env.SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"PaceSetter School" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log('[Email] Sent successfully via Custom SMTP to', toEmail);
      return { success: true, method: 'smtp' };
    } catch (e: any) {
      console.warn('[Email] Custom SMTP failed:', e.message);
    }
  }

  // 4. Ethereal Email (Automated Live SMTP Test Mailbox)
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"PaceSetter School Security" <security@pacesetter.school>',
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log('[Email] Sent to Ethereal SMTP test mailbox. Preview URL:', previewUrl);
    return { success: true, method: 'ethereal', previewUrl };
  } catch (e: any) {
    console.error('[Email] All email transports failed:', e.message);
    return { success: false, method: 'failed', error: e.message };
  }
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint: Send OTP to email
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Укажите корректный адрес электронной почты' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const code = generateRandomCode();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    console.log(`[API /send-otp] Generating random code ${code} for ${cleanEmail}`);

    const sendResult = await sendRealEmail(cleanEmail, code);

    // Save in server store
    otpStore.set(cleanEmail, {
      code,
      email: cleanEmail,
      expiresAt,
      attempts: 0,
      method: sendResult.method,
      previewUrl: sendResult.previewUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });

    return res.json({
      success: true,
      email: cleanEmail,
      method: sendResult.method,
      previewUrl: sendResult.previewUrl,
      code: process.env.NODE_ENV !== 'production' ? code : undefined, // included in dev for seamless UI simulation if needed
      message: `Код подтверждения успешно отправлен на ${cleanEmail}`,
    });
  } catch (err: any) {
    console.error('[API /send-otp] Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Ошибка отправки письма' });
  }
});

// Endpoint: Verify OTP
app.post('/api/verify-otp', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Требуется email и проверочный код' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().replace(/\s+/g, '').trim();

    const record = otpStore.get(cleanEmail);
    if (!record) {
      return res.status(400).json({ success: false, error: 'Код подтверждения не найден или истек. Запросите новый код.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ success: false, error: 'Срок действия кода истек (10 минут). Запросите новый код.' });
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      otpStore.delete(cleanEmail);
      return res.status(429).json({ success: false, error: 'Превышено количество попыток. Запросите новый код.' });
    }

    if (record.code === cleanCode) {
      otpStore.delete(cleanEmail);
      return res.json({ success: true, message: 'Код успешно подтвержден' });
    } else {
      return res.status(400).json({ success: false, error: 'Неверный проверочный код. Проверьте входящее письмо.' });
    }
  } catch (err: any) {
    console.error('[API /verify-otp] Error:', err);
    return res.status(500).json({ success: false, error: 'Ошибка проверки кода' });
  }
});

// High-performance streaming proxy for Google Drive videos (Instant HTML5 playback)
app.all('/api/video-stream/:fileId', async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).send('Method not allowed');
  }

  const { fileId } = req.params;
  if (!fileId || !/^[a-zA-Z0-9_-]{20,60}$/.test(fileId)) {
    return res.status(400).send('Invalid fileId');
  }

  const driveDownloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;

  const requestHeaders: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  if (req.headers.range) {
    requestHeaders['Range'] = req.headers.range;
  } else if (req.method === 'HEAD') {
    requestHeaders['Range'] = 'bytes=0-0';
  }

  try {
    const controller = new AbortController();
    req.on('close', () => {
      controller.abort();
    });

    const upstreamResponse = await fetch(driveDownloadUrl, {
      method: 'GET',
      headers: requestHeaders,
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      return res.status(upstreamResponse.status).send('Upstream video service returned error');
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'video/mp4';
    const contentRange = upstreamResponse.headers.get('content-range');
    const contentLength = upstreamResponse.headers.get('content-length');
    const acceptRanges = upstreamResponse.headers.get('accept-ranges') || 'bytes';

    if (req.method === 'HEAD' && !req.headers.range && contentRange) {
      const match = contentRange.match(/\/(\d+)$/);
      if (match) {
        res.setHeader('Content-Length', match[1]);
      }
      res.status(200);
    } else {
      res.status(upstreamResponse.status);
      if (contentRange) res.setHeader('Content-Range', contentRange);
      if (contentLength) res.setHeader('Content-Length', contentLength);
    }

    res.setHeader('Content-Type', contentType.includes('text/html') ? 'video/mp4' : contentType);
    res.setHeader('Accept-Ranges', acceptRanges);
    res.setHeader('Cache-Control', 'public, max-age=7200');

    if (req.method === 'HEAD') {
      return res.end();
    }

    if (upstreamResponse.body) {
      // @ts-ignore
      const nodeStream = Readable.fromWeb(upstreamResponse.body);
      nodeStream.on('error', () => {});
      res.on('error', () => {});
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    if (err.name === 'AbortError' || err.code === 'ERR_STREAM_PREMATURE_CLOSE') {
      return;
    }
    console.error(`[Video Stream Error ${fileId}]:`, err.message || err);
    if (!res.headersSent) {
      res.status(500).send('Error streaming video');
    }
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PaceSetter School Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
