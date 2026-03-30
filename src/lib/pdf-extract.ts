/**
 * Extract text content from a PDF buffer.
 * Runs server-side only (Node.js runtime, not Edge).
 * Uses dynamic require to avoid DOMMatrix errors on Vercel serverless.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdf = require("pdf-parse");
  const data = await pdf(buffer);
  return data.text.trim();
}
