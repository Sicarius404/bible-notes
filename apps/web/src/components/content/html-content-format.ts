const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character])
}

const EMPTY_PARAGRAPH_PATTERN =
  /<p(?:\s[^>]*)?>(?:[\s\u00a0]|&nbsp;|<br(?:\s[^>]*)?\s*\/?>)*<\/p>/gi

export function formatPlainTextAsHtml(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.split('\n').map(escapeHtml).join('<br>')}</p>`)
    .join('')
}

export function removeEmptyParagraphsFromHtml(html: string) {
  return html.replace(EMPTY_PARAGRAPH_PATTERN, '')
}
