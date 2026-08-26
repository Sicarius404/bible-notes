import { extractVerseRefs, verseToUrl } from '@bible-notes/shared'

export default function VerseContent({ text }: { text: string }) {
  const refs = extractVerseRefs(text)
  if (refs.length === 0) {
    return <p className="whitespace-pre-wrap">{text}</p>
  }

  const parts: React.ReactNode[] = []
  let remaining = text

  for (const ref of refs) {
    const idx = remaining.indexOf(ref)
    if (idx === -1) continue
    if (idx > 0) {
      parts.push(<span key={`t-${parts.length}`}>{remaining.slice(0, idx)}</span>)
    }
    parts.push(
      <a
        key={`v-${parts.length}`}
        href={verseToUrl(ref)}
        target="_blank"
        rel="noopener noreferrer"
        className="verse-link"
      >
        {ref}
      </a>
    )
    remaining = remaining.slice(idx + ref.length)
  }

  if (remaining) {
    parts.push(<span key="end">{remaining}</span>)
  }

  return <p className="whitespace-pre-wrap">{parts}</p>
}
