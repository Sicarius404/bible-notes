import assert from 'node:assert/strict'
import test from 'node:test'

// Import the shared content-contract helpers and the local format helpers.
// The shared package's compiled dist uses extensionless ESM imports that Node's
// test runner cannot resolve, so we exercise the shared source module directly
// (it has no relative/package imports and is safe to load as ESM).
// @ts-expect-error TS5097 - these tests are executed directly by Node.
import { stripHtml, getContentPreview, htmlToPlainText } from '../../../../packages/shared/src/html.ts'

// @ts-expect-error TS5097 - this test is executed directly by Node.
import { formatPlainTextAsHtml, removeEmptyParagraphsFromHtml } from './html-content-format.ts'

// ---------------------------------------------------------------------------
// stripHtml
// ---------------------------------------------------------------------------

test('stripHtml removes html tags and keeps text', () => {
  assert.equal(stripHtml('<p>This is important</p>'), 'This is important')
})

test('stripHtml is a no-op on legacy plain text', () => {
  assert.equal(stripHtml('Romans 8:1 No condemnation'), 'Romans 8:1 No condemnation')
})

test('stripHtml converts block-closing tags to line breaks', () => {
  const out = stripHtml('<p>Line one</p><p>Line two</p>')
  assert.equal(out, 'Line one\nLine two')
})

test('stripHtml converts <br> to a line break', () => {
  assert.equal(stripHtml('Romans 8:1<br>No condemnation'), 'Romans 8:1\nNo condemnation')
})

test('stripHtml prefixes list items with a bullet', () => {
  assert.equal(stripHtml('<ul><li>Point one</li><li>Point two</li></ul>'), '• Point one\n• Point two')
})

test('stripHtml collapses runs of whitespace', () => {
  assert.equal(stripHtml('<p>foo   bar</p>'), 'foo bar')
})

test('stripHtml returns empty string for empty input', () => {
  assert.equal(stripHtml(''), '')
  assert.equal(stripHtml('<p></p>'), '')
})

test('htmlToPlainText is an alias for stripHtml', () => {
  assert.equal(htmlToPlainText('<p>hello</p>'), 'hello')
})

// ---------------------------------------------------------------------------
// getContentPreview
// ---------------------------------------------------------------------------

test('getContentPreview returns short content unchanged', () => {
  assert.equal(getContentPreview('<p>Hello world</p>', 100), 'Hello world')
})

test('getContentPreview returns content exactly at maxLength unchanged', () => {
  assert.equal(getContentPreview('<p>Hello world</p>', 11), 'Hello world')
})

test('getContentPreview strips html and truncates long content with ellipsis', () => {
  const out = getContentPreview('<p>One two three four five six seven eight nine ten</p>', 15)
  // Trims back to a whole word when the cut falls mid-word.
  assert.equal(out, 'One two three…')
})

test('getContentPreview keeps legacy plain text', () => {
  const out = getContentPreview('Romans 8:1 No condemnation', 100)
  assert.equal(out, 'Romans 8:1 No condemnation')
})

test('getContentPreview returns empty string for empty content', () => {
  assert.equal(getContentPreview('', 100), '')
  assert.equal(getContentPreview('<p></p>', 100), '')
})

test('getContentPreview renders list content as excerpt', () => {
  const out = getContentPreview('<ul><li>Point one</li><li>Point two</li></ul>', 100)
  assert.equal(out, '• Point one\n• Point two')
})

test('getContentPreview handles blockquote and nested formatting', () => {
  const out = getContentPreview('<blockquote><p>Quoted text</p></blockquote><p>End</p>', 100)
  // Both the closing </p> and </blockquote> emit a newline, so a blank line
  // separates the two block elements in the flat excerpt.
  assert.equal(out, 'Quoted text\n\nEnd')
})

// ---------------------------------------------------------------------------
// formatPlainTextAsHtml / removeEmptyParagraphsFromHtml
// ---------------------------------------------------------------------------

test('formatPlainTextAsHtml wraps plain text in paragraphs', () => {
  assert.equal(formatPlainTextAsHtml('First line\n\nSecond line'), '<p>First line</p><p>Second line</p>')
})

test('formatPlainTextAsHtml escapes html in legacy plain text', () => {
  // A legacy plain-text note containing angle brackets should not interpret them.
  assert.equal(formatPlainTextAsHtml('Some <tag> text'), '<p>Some &lt;tag&gt; text</p>')
})

test('removeEmptyParagraphsFromHtml drops empty paragraphs', () => {
  const html =
    '<p>First</p><p></p><p><br class="ProseMirror-trailingBreak"></p><p class="empty">&nbsp;</p><p>Second</p>'
  assert.equal(removeEmptyParagraphsFromHtml(html), '<p>First</p><p>Second</p>')
})
