import type { AdminSessionRow } from '@/types/adminSession';

function deviceFromUA(ua: string): string {
  const mobile = /Mobile|Android|iPhone/i.test(ua);
  let browser = 'متصفح';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : mobile ? 'جوال' : 'سطح المكتب';
  return `${browser} · ${os}`;
}

/** صفوف جلسات وهمية للوحة الأمان — لا تمثل خادماً حقيقياً */
export function seedDemoAdminSessions(): AdminSessionRow[] {
  const now = Date.now();
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  return [
    {
      id: 'sess_current',
      deviceLabel: deviceFromUA(ua) + ' (هذه الجلسة)',
      ip: '127.0.0.1',
      lastSeen: new Date(now).toISOString(),
      current: true
    },
    {
      id: 'sess_mock_1',
      deviceLabel: 'Chrome · Windows',
      ip: '192.168.1.24',
      lastSeen: new Date(now - 45 * 60 * 1000).toISOString()
    },
    {
      id: 'sess_mock_2',
      deviceLabel: 'Safari · iPhone',
      ip: '10.0.0.8',
      lastSeen: new Date(now - 26 * 3600 * 1000).toISOString()
    }
  ];
}
