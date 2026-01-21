// src/core/pixelGrid.ts
import { inBounds } from './coord'

export class PixelGrid {
  readonly width: number
  readonly height: number
  readonly pixels: Uint32Array

  constructor(width: number, height: number, pixels?: Uint32Array) {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
      throw new Error(`Invalid grid size: ${width}x${height}`)
    }
    this.width = width
    this.height = height
    const n = width * height

    if (pixels) {
      if (!(pixels instanceof Uint32Array)) throw new Error('pixels must be Uint32Array')
      if (pixels.length !== n) throw new Error(`pixels length mismatch: ${pixels.length} != ${n}`)
      this.pixels = pixels
    } else {
      this.pixels = new Uint32Array(n)
    }
  }

  static create(width: number, height: number, fillArgb = 0x00000000): PixelGrid {
    const g = new PixelGrid(width, height)
    if (fillArgb !== 0) g.fill(fillArgb)
    return g
  }

  index(x: number, y: number): number {
    return y * this.width + x
  }

  getPixel(x: number, y: number): number {
    if (!inBounds(x, y, this.width, this.height)) return 0
    return this.pixels[this.index(x, y)]
  }

  setPixel(x: number, y: number, argb: number): boolean {
    if (!inBounds(x, y, this.width, this.height)) return false
    this.pixels[this.index(x, y)] = argb >>> 0
    return true
  }

  fill(argb: number): void {
    this.pixels.fill(argb >>> 0)
  }

  clonePixels(): Uint32Array {
    return this.pixels.slice()
  }

  withClonedPixels(): PixelGrid {
    return new PixelGrid(this.width, this.height, this.clonePixels())
  }
}
