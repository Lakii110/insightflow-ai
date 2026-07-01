/**
 * Extracts text content from uploaded files.
 * Supports: TXT, CSV, DOCX, PDF (text-based), JSON, MD
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  // Plain text formats
  if (["txt", "md", "csv", "json", "xml"].includes(ext)) {
    return await file.text();
  }

  // DOCX — use mammoth
  if (ext === "docx") {
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch {
      return `[DOCX file: ${file.name} — mammoth extraction failed, using filename as context]`;
    }
  }

  // PDF — try native text extraction via PDF.js or fallback
  if (ext === "pdf") {
    try {
      const text = await extractPDFText(file);
      return text;
    } catch {
      return `[PDF file: ${file.name} — binary PDF, content indexed by filename]`;
    }
  }

  // Image files
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return `[Image file: ${file.name} — visual content, OCR not available in demo]`;
  }

  // Fallback — try reading as text
  try {
    return await file.text();
  } catch {
    return `[File: ${file.name} — could not extract text content]`;
  }
}

async function extractPDFText(file: File): Promise<string> {
  // Try to load pdfjs-dist dynamically
  try {
    const pdfjsLib = await import("pdfjs-dist");
    // Set worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: unknown) => (item as { str: string }).str)
        .join(" ");
      textParts.push(pageText);
    }

    return textParts.join("\n\n") || `[PDF: ${file.name} — no extractable text found]`;
  } catch {
    return `[PDF: ${file.name} — could not parse PDF content]`;
  }
}

/**
 * Extract simple topics from text using keyword frequency
 */
export function extractTopics(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "was", "are", "were", "be", "been",
    "has", "have", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "that", "this", "these",
    "those", "it", "its", "they", "them", "their", "we", "our", "you",
    "your", "he", "she", "his", "her", "i", "me", "my", "not", "no",
    "all", "also", "more", "than", "as", "if", "so", "what", "which",
    "when", "where", "how", "who", "why", "about", "after", "before"
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 4 && !stopWords.has(w));

  const freq: Record<string, number> = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

/**
 * Generate a short summary from text (first 3 meaningful sentences)
 */
export function generateSummary(text: string, maxLength = 200): string {
  if (!text || text.startsWith("[")) return "Document content indexed for AI analysis.";

  const sentences = text
    .replace(/\s+/g, " ")
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 300);

  if (sentences.length === 0) return text.slice(0, maxLength) + "...";

  const summary = sentences.slice(0, 2).join(". ") + ".";
  return summary.length > maxLength ? summary.slice(0, maxLength) + "..." : summary;
}
