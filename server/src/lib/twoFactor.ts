import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { Secret, TOTP } from 'otpauth';

/** توليد سر TOTP جديد (base32) */
export function newTwofaSecretBase32(): string {
  return new Secret({ size: 20 }).base32;
}

export function totpFor(email: string, secretB32: string): TOTP {
  return new TOTP({
    issuer: 'EduNor',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretB32)
  });
}

export function validateTotp(secretB32: string, email: string, code: string): boolean {
  const totp = totpFor(email, secretB32);
  return totp.validate({ token: code.replace(/\s/g, ''), window: 2 }) != null;
}

export function generateRecoveryCodes(count = 10): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(crypto.randomBytes(6).toString('hex'));
  return out;
}

export async function hashRecoveryCodesForStore(plain: string[]): Promise<string> {
  const hashes = await Promise.all(plain.map((c) => bcrypt.hash(c, 10)));
  return JSON.stringify(hashes);
}

export async function consumeRecoveryCode(
  code: string,
  recoveryHashesJson: string
): Promise<{ ok: boolean; nextJson: string }> {
  let hashes: string[];
  try {
    hashes = JSON.parse(recoveryHashesJson) as string[];
  } catch {
    return { ok: false, nextJson: '[]' };
  }
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(code.trim(), hashes[i])) {
      const next = hashes.filter((_, j) => j !== i);
      return { ok: true, nextJson: JSON.stringify(next) };
    }
  }
  return { ok: false, nextJson: recoveryHashesJson };
}
