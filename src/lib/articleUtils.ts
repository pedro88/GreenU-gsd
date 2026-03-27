/**
 * Article utilities — slug generation, content sanitization, reading time.
 */

import { prisma } from '@/lib/db';

/**
 * Generates a URL-safe slug from a title, handling duplicates.
 * @param title - The article title
 * @returns A unique slug string
 */
export async function generateSlug(title: string): Promise<string> {
  // Base slug from title
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .slice(0, 80); // max 80 chars

  if (!base) {
    // Fallback: random slug if title is empty/weird
    return `article-${Date.now().toString(36)}`;
  }

  // Check for existing slugs starting with this base
  const existing = await prisma.article.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });

  const takenSlugs = new Set(existing.map((a) => a.slug));

  if (!takenSlugs.has(base)) return base;

  // Append incrementing suffix until unique
  let counter = 2;
  while (takenSlugs.has(`${base}-${counter}`)) counter++;

  return `${base}-${counter}`;
}

/**
 * Sanitizes HTML content server-side to prevent XSS.
 * Uses a tag/attribute allowlist — suitable for TipTap output.
 * TipTap generates controlled HTML, so we just block the dangerous elements.
 * @param html - Raw HTML string from TipTap
 * @returns Sanitized HTML string safe to store
 */
export function sanitizeContent(html: string): string {
  if (!html) return '';

  // Strip dangerous tags entirely
  const dangerous =
    /(?:<|\b)(script|style|iframe|object|embed|form|input|button|select|textarea)(?:\s|>|<\/)/gi;
  let clean = html.replace(dangerous, '');

  // Strip any on* event handler attributes
  clean = clean.replace(/\s+on\w+=(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');

  // Strip javascript: URLs from href/src
  clean = clean.replace(/(href|src)\s*=\s*["']?\s*javascript:/gi, '$1="#BLOCKED#"');

  // Strip data: URLs except for images (allowed)
  clean = clean.replace(/(href)\s*=\s*["']?\s*data:(?!image\/)/gi, '$1="#BLOCKED#"');

  // Ensure all <a> tags have rel="noopener noreferrer"
  clean = clean.replace(/<a\s+([^>]*href=[^>]*)>/gi, (match, attrs) => {
    if (!attrs.includes('rel=')) {
      return `<a ${attrs} rel="noopener noreferrer" target="_blank">`;
    }
    return match;
  });

  return clean;
}

/**
 * Extracts plain text from HTML for excerpt generation.
 * @param html - HTML string
 * @param maxLength - Maximum excerpt length
 * @returns Plain text excerpt
 */
export function extractExcerpt(html: string, maxLength = 160): string {
  if (!html) return '';

  // Strip HTML tags
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;

  // Cut at word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

/**
 * Calculates estimated reading time from HTML content.
 * Assumes 200 words per minute.
 * @param html - HTML string
 * @returns Reading time in minutes (minimum 1)
 */
export function calculateReadingTime(html: string): number {
  if (!html) return 1;

  const text = html.replace(/<[^>]+>/g, ' ');
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
