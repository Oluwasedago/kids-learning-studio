/** Morning until 12:00, afternoon until 18:00, then evening. */
export function dayPart(d: Date): 'morning' | 'afternoon' | 'evening' {
  const h = d.getHours()
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
}
