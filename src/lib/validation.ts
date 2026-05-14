// src/lib/validation.ts
// Centralized input validation and sanitization — OWASP compliant

import { NextResponse } from 'next/server';

// ── SANITIZE STRING ───────────────────────────────────────────────────────
// Removes dangerous characters that could be used for injection attacks
export function sanitizeString(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';

  return input
    .slice(0, maxLength) // enforce length limit
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // remove script tags
    .replace(/<[^>]+>/g, '') // strip all HTML tags
    .replace(/javascript:/gi, '') // remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // remove event handlers
    .replace(/\x00/g, '') // remove null bytes
    .trim();
}

// ── SANITIZE NUMBER ───────────────────────────────────────────────────────
export function sanitizeNumber(
  input: unknown,
  min: number,
  max: number,
  defaultValue: number
): number {
  const num = Number(input);
  if (isNaN(num)) return defaultValue;
  return Math.min(max, Math.max(min, Math.floor(num)));
}

// ── SANITIZE ARRAY ────────────────────────────────────────────────────────
export function sanitizeArray(
  input: unknown,
  maxItems: number = 20,
  maxItemLength: number = 200
): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, maxItems)
    .filter((item) => typeof item === 'string')
    .map((item) => sanitizeString(item, maxItemLength));
}

// ── SANITIZE ENUM ─────────────────────────────────────────────────────────
// Only allow values from a whitelist
export function sanitizeEnum<T extends string>(
  input: unknown,
  allowedValues: T[],
  defaultValue: T
): T {
  if (typeof input !== 'string') return defaultValue;
  const clean = input.toLowerCase().trim();
  return (allowedValues.includes(clean as T) ? clean : defaultValue) as T;
}

// ── SANITIZE MESSAGES ARRAY ───────────────────────────────────────────────
// For AI conversation history
export function sanitizeMessages(input: unknown): Array<{ role: string; content: string }> {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 50) // max 50 messages in history
    .filter((m) => m && typeof m === 'object')
    .map((m: Record<string, unknown>) => ({
      role: sanitizeEnum(m.role as unknown, ['user', 'assistant', 'system'], 'user'),
      content: sanitizeString(m.content, 2000),
    }))
    .filter((m) => m.content.length > 0);
}

// ── VALIDATE REQUEST BODY SIZE ────────────────────────────────────────────
export function checkBodySize(body: unknown, maxSizeBytes: number = 50000): boolean {
  try {
    const size = JSON.stringify(body).length;
    return size <= maxSizeBytes;
  } catch {
    return false;
  }
}

// ── STRIP UNEXPECTED FIELDS ───────────────────────────────────────────────
// Only keep fields that are in the allowed list
export function stripUnexpectedFields<T extends object>(
  body: Record<string, unknown>,
  allowedFields: (keyof T)[]
): Partial<T> {
  const clean: Partial<T> = {};
  for (const field of allowedFields) {
    if (field in body) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clean as any)[field] = body[field as string];
    }
  }
  return clean;
}

/** Same as stripUnexpectedFields but accepts a plain string list (API routes). */
export function stripAllowedKeys(body: Record<string, unknown>, allowedFields: readonly string[]): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) clean[field] = body[field];
  }
  return clean;
}

// ── VALIDATE LANGUAGE ─────────────────────────────────────────────────────
export function validateLanguage(input: unknown): 'english' | 'hindi' | 'hinglish' {
  return sanitizeEnum(input, ['english', 'hindi', 'hinglish'], 'english');
}

// ── VALIDATE BOOLEAN ──────────────────────────────────────────────────────
export function validateBoolean(input: unknown, defaultValue: boolean = false): boolean {
  if (typeof input === 'boolean') return input;
  if (input === 'true') return true;
  if (input === 'false') return false;
  return defaultValue;
}

/** Shallow string sanitization for nested records (e.g. pitch-deck `answers`). */
export function sanitizeStringRecord(
  input: unknown,
  maxKeys = 40,
  maxKeyLen = 80,
  maxValLen = 8000
): Record<string, string> {
  if (!input || typeof input !== 'object') return {};
  const out: Record<string, string> = {};
  let n = 0;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (n >= maxKeys) break;
    const key = sanitizeString(k, maxKeyLen);
    if (!key) continue;
    out[key] =
      typeof v === 'string' ? sanitizeString(v, maxValLen) : sanitizeString(String(v ?? ''), maxValLen);
    n += 1;
  }
  return out;
}

/**
 * SECURITY: Parse JSON POST bodies safely with size limits and field allowlisting.
 * OWASP Reference: A04:2021 Insecure Design / A05:2021 Security Misconfiguration
 */
export function sanitizeJsonPostBody(
  rawBody: unknown,
  allowedFields: readonly string[],
  maxSizeBytes = 50000
): { ok: true; body: Record<string, unknown> } | { ok: false; response: NextResponse } {
  // SECURITY: Reject oversized requests to prevent DoS attacks
  // OWASP Reference: A05:2021 Security Misconfiguration
  if (!checkBodySize(rawBody, maxSizeBytes)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Request too large' }, { status: 413 }),
    };
  }
  if (typeof rawBody !== 'object' || rawBody === null) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
    };
  }
  // SECURITY: Strip unexpected fields to prevent mass assignment attacks
  // OWASP Reference: A04:2021 Insecure Design
  const body = stripAllowedKeys(rawBody as Record<string, unknown>, allowedFields);
  return { ok: true, body };
}
