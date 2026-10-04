import { isIP } from 'node:net';
export function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const u = new URL(value);
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || isIP(u.hostname.replace(/^\[|\]$/g, '')) || !u.hostname.includes('.') || /(^|\.)(localhost|local|internal|test|invalid)$/.test(u.hostname)) return null;
    u.hash = '';
    return u.href;
  } catch { return null; }
}
export const normalize = (v: string) => v.normalize('NFKC').toLowerCase().replace(/^(dr\.?|prof\.?)\s+/,'').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export const unique = <T>(items: T[]): T[] => [...new Set(items)];
