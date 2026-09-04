/**
 * Wraps every word of a string in a span so GSAP can stagger them.
 * Preserves the spaces as part of each word span (white-space: pre in CSS)
 * so the line breaks the way the browser would break the original text.
 */
export function splitWords(text: string): string[] {
  return text.split(/(\s+)/).filter((chunk) => chunk.length > 0);
}
