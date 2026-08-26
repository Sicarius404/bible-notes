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

/**
 * Produce a plain-text excerpt for list/preview/subtitle contexts.
 *
 * The persisted `content` contract is:
 *   - New/edited content is saved as TipTap HTML.
 *   - Legacy records may still hold plain text; this helper is backward
 *     compatible because stripHtml() is a no-op on text without tags.
 *
 * This is the single entry point for *preview* rendering. Full rich-text
 * rendering belongs to the dedicated content components (HtmlContent on web,
 * SmartContent on mobile), and editing belongs to TipTap.
 */
export function getContentPreview(content: string, maxLength = 160): string {
  const text = stripHtml(content)
  if (!text) return ''
  if (text.length <= maxLength) return text

  const slice = text.slice(0, maxLength)
  const lastSpace = slice.lastIndexOf(' ')
  // Trim back to a whole word when the cut falls mid-word, so we don't leave
  // an orphaned fragment, but never shorten below ~60% of the target length.
  const cutoff = lastSpace > maxLength * 0.6 ? lastSpace : maxLength
  return slice.slice(0, cutoff).trimEnd() + '…'
}
