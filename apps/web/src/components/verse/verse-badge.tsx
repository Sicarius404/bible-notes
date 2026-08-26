import { verseToUrl } from '@bible-notes/shared'
import { Badge } from '@/components/ui/badge'

export function VerseBadge({ reference, version }: { reference: string; version?: string }) {
  const url = verseToUrl(reference, version)
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 transition-colors">
        {reference}
      </Badge>
    </a>
  )
}
