import { type PointerEvent, useRef } from 'react'

/**
 * A tap and a long press on the same button (e.g. a locked tile: a tap points to the missions, holding it
 * for 2 seconds asks for the parent password). Returns the pointer handlers to spread on the element.
 */
export function useLongPress(onTap: () => void, onLong: () => void, ms = 2000) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fired = useRef(false)
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  return {
    onPointerDown: (e: PointerEvent) => {
      ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
      fired.current = false
      cancel()
      timer.current = setTimeout(() => {
        fired.current = true
        onLong()
      }, ms)
    },
    onPointerUp: () => {
      cancel()
      if (!fired.current) onTap()
    },
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    // No menu or text selection while holding.
    onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
  }
}
