// src/core/tools.ts
import { PixelGrid } from './pixelGrid'
import { inBounds } from './coord'

export type ToolKind = 'pencil' | 'fill'

export function applyPencil(grid: PixelGrid, x: number, y: number, argb: number): boolean {
  return grid.setPixel(x, y, argb)
}

// 4-way flood fill
export function applyFill(grid: PixelGrid, x: number, y: number, argb: number): number {
  if (!inBounds(x, y, grid.width, grid.height)) return 0

  const target = grid.getPixel(x, y) >>> 0
  const replacement = argb >>> 0
  if (target === replacement) return 0

  const w = grid.width
  const h = grid.height
  const pixels = grid.pixels

  const stackX: number[] = [x]
  const stackY: number[] = [y]

  let filled = 0

  while (stackX.length) {
    const cx = stackX.pop()!
    const cy = stackY.pop()!
    const idx = cy * w + cx
    if (pixels[idx] !== target) continue

    pixels[idx] = replacement
    filled++

    // neighbors
    if (cx > 0) { stackX.push(cx - 1); stackY.push(cy) }
    if (cx + 1 < w) { stackX.push(cx + 1); stackY.push(cy) }
    if (cy > 0) { stackX.push(cx); stackY.push(cy - 1) }
    if (cy + 1 < h) { stackX.push(cx); stackY.push(cy + 1) }
  }

  return filled
}
