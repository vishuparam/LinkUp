import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'node:http';

/** Minimal Vercel Node request shape; keeps the core adapter independent of Vercel SDK types. */
export type VercelRequest = IncomingMessage & {
  method?: string;
  headers: IncomingHttpHeaders & {origin?: string; 'content-type'?: string};
  body?: unknown;
};

/** Minimal response helpers supplied by Vercel's Node function runtime. */
export type VercelResponse = ServerResponse & {
  status(code: number): VercelResponse;
  json(value: unknown): VercelResponse;
};
