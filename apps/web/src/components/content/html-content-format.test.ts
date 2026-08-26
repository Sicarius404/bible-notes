import assert from 'node:assert/strict'
import test from 'node:test'

// Node's built-in test runner needs the TypeScript file extension here.
// @ts-expect-error TS5097 - this test is executed directly by Node.
import * as htmlContentFormat from './html-content-format.ts'

const { formatPlainTextAsHtml, removeEmptyParagraphsFromHtml } = htmlContentFormat

test('formats blank-line separated text without empty paragraphs', () => {
  const html = formatPlainTextAsHtml('First line\n\nSecond line')

  assert.equal(html, '<p>First line</p><p>Second line</p>')
  assert.equal(html.includes('<p></p>'), false)
})

test('preserves single line breaks inside a paragraph', () => {
  const html = formatPlainTextAsHtml('Romans 8:1\nNo condemnation')

  assert.equal(html, '<p>Romans 8:1<br>No condemnation</p>')
})

test('removes empty paragraphs from rich text html', () => {
  const html = removeEmptyParagraphsFromHtml(
    '<p>First line</p><p></p><p><br class="ProseMirror-trailingBreak"></p><p class="empty">&nbsp;</p><p>Second line</p>'
  )

  assert.equal(html, '<p>First line</p><p>Second line</p>')
})
