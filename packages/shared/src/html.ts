/**
 * Convert HTML to readable plain text by stripping tags.
 * Block-level tags and <br> are replaced with a newline so adjacent text
 * doesn't run together; remaining tags are removed and whitespace is collapsed.
 *
 * Used for list/preview/subtitle contexts where we only want a text excerpt
 * (rendering full HTML belongs to the dedicated content components).
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  const withSpaces = html
    .replace(/<\/(p|div|h[1-6]|li|blockquote|tr|ul|ol)>/gi, '\n')
    .replace(/<(br|hr)\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
  return withSpaces
    .replace(/<[^>]*>/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

export { stripHtml as htmlToPlainText }
