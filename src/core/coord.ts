// src/core/coord.ts
export type GridPoint = Readonly<{ x: number; y: number }>

export function inBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && y >= 0 && x < width && y < height
}

export function clampInt(v: number, min: number, max: number): number {
  if (v < min) return min
  if (v > max) return max
  return v | 0
}
