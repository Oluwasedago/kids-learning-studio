import { COUNTRIES, type FlagShape } from '@/lessons/data'

/** A flag as SVG (3:2), with a thin border so white flags show on white cards. */
export function Flag({ shape, width = 120 }: { shape: FlagShape; width?: number }) {
  const W = 30
  const H = 20
  let body
  if (shape.kind === 'h') {
    const h = H / shape.colors.length
    body = shape.colors.map((c, i) => <rect key={i} x={0} y={i * h} width={W} height={h + 0.05} fill={c} />)
  } else if (shape.kind === 'v') {
    const w = W / shape.colors.length
    body = shape.colors.map((c, i) => <rect key={i} x={i * w} y={0} width={w + 0.05} height={H} fill={c} />)
  } else if (shape.kind === 'disc') {
    body = (
      <>
        <rect width={W} height={H} fill={shape.field} />
        <circle cx={W / 2} cy={H / 2} r={6} fill={shape.disc} />
      </>
    )
  } else if (shape.nordic) {
    body = (
      <>
        <rect width={W} height={H} fill={shape.field} />
        <rect x={9} y={0} width={4} height={H} fill={shape.cross} />
        <rect x={0} y={8} width={W} height={4} fill={shape.cross} />
      </>
    )
  } else {
    // Swiss: a white cross in the middle (the real flag is square; here it sits centred on the card).
    body = (
      <>
        <rect width={W} height={H} fill={shape.field} />
        <rect x={13} y={4} width={4} height={12} fill={shape.cross} />
        <rect x={9} y={8} width={12} height={4} fill={shape.cross} />
      </>
    )
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={width} height={(width * H) / W} className="flag" aria-hidden>
      {body}
      <rect width={W} height={H} fill="none" stroke="rgb(0 0 0 / 18%)" strokeWidth={0.4} />
    </svg>
  )
}

/** The flag of a country by its id ("fr"), or nothing for an unknown id. */
export function CountryFlag({ id, width }: { id: string; width?: number }) {
  const c = COUNTRIES.find((x) => x.id === id)
  return c ? <Flag shape={c.shape} width={width} /> : null
}
