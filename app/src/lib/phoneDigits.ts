/**
 * يحوّل الأرقام العربية (٠–٩) والفارسية (۰–۹) إلى 0–9، ثم يبقي أرقاماً لاتينية فقط.
 * بدون هذا، `replace(/\D/g, '')` يحذف «الأرقام العربية» لأن \d في RegExp = [0-9] فقط.
 */
export function digitsOnlyNormalized(input: string): string {
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  let out = '';
  for (const ch of input) {
    const ai = arabic.indexOf(ch);
    if (ai !== -1) {
      out += String(ai);
      continue;
    }
    const pi = persian.indexOf(ch);
    if (pi !== -1) {
      out += String(pi);
      continue;
    }
    out += ch;
  }
  return out.replace(/\D/g, '');
}
