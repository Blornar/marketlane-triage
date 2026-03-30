/**
 * Extract text content from a PDF buffer.
 * Runs server-side only (Node.js runtime, not Edge).
 * pdf-parse is listed in serverExternalPackages in next.config.mjs
 * to avoid DOMMatrix errors in Vercel's serverless bundler.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdf = require("pdf-parse");
  const data = await pdf(buffer);
  return data.text.trim();
}
