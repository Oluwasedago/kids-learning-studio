// A 3D picture from public/emoji (Microsoft Fluent Emoji, MIT; see public/emoji/CREDITS.md).
// Decorative by default (alt=""), because the text next to it says the same.
// BASE_URL is where the app lives ("./" in our build), so this works under /kids-learning-studio/ too.

export function Emoji({ name, size = 48, label, className }: { name: string; size?: number; label?: string; className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}emoji/${name}.png`}
      width={size}
      height={size}
      alt={label ?? ''}
      draggable={false}
      className={className ? `emoji ${className}` : 'emoji'}
    />
  )
}
