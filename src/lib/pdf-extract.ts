// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse");

/**
 * Extract text content from a PDF buffer.
 * Runs server-side only (Node.js runtime, not Edge).
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text.trim();
}
