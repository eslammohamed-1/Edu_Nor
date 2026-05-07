import type { Env } from '../env.js';

export interface SendEmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * طبقة بريد: التطوير = سجل فقط؛ الإنتاج يمكن ربطها لاحقاً بـ SMTP/Resend عبر env.
 */
export async function sendEmail(_env: Env, payload: SendEmailPayload): Promise<void> {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.warn('[email] SMTP مُعرّف لكن الإرسال الفعلي غير مفعّل بعد — سجل الرسالة:');
  }
  const preview = payload.text.slice(0, 500);
  console.log(
    `[email] to=${payload.to} subject=${payload.subject}\n---\n${preview}${payload.text.length > 500 ? '…' : ''}\n---`
  );
}
