/** Return a persisted date in the format accepted by an HTML date input. */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ''

  const datePart = value.trim().split(/[T ]/, 1)[0]
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : ''
}
