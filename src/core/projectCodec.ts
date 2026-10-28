// src/core/projectCodec.ts
import { PROJECT_VERSION, PALETTE_16, MAX_PALETTE_COLORS, DEFAULT_CUSTOM_COLOR } from './constants'

export type ProjectDTO = {
  version: number
  width: number
  height: number
  palette: string[]
  pixels: number[]
}

export type ProjectData = {
  version: number
  width: number
  height: number
  palette: string[]
  pixels: Uint32Array
}

function defaultPalette(): string[] {
  return [...PALETTE_16, DEFAULT_CUSTOM_COLOR]
}

export function makeNewProject(width: number, height: number, fillArgb = 0x00000000): ProjectData {
  const pixels = new Uint32Array(width * height)
  if (fillArgb !== 0) pixels.fill(fillArgb >>> 0)
  return {
    version: PROJECT_VERSION,
    width,
    height,
    palette: defaultPalette(),
    pixels,
  }
}

export function encodeProject(project: ProjectData): ProjectDTO {
  return {
    version: project.version,
    width: project.width,
    height: project.height,
    palette: [...project.palette],
    pixels: Array.from(project.pixels, (v) => v >>> 0),
  }
}

function normalizePalette(palette: unknown[]): string[] {
  // v1(16색)도 받아서 custom 1칸을 뒤에 붙여줌
  if (palette.length < 1 || palette.length > MAX_PALETTE_COLORS) {
    throw new Error(`Invalid project: palette length (expected 1-${MAX_PALETTE_COLORS})`)
  }
  if (palette.some((color) => typeof color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(color))) {
    throw new Error('Invalid project: palette color')
  }
  const normalized = palette.map((color) => (color as string).toLowerCase())
  if (normalized.length === 16) normalized.push(DEFAULT_CUSTOM_COLOR)
  return normalized
}

export function decodeProject(input: unknown): ProjectData {
  const obj = typeof input === 'string' ? JSON.parse(input) : input
  if (!obj || typeof obj !== 'object') throw new Error('Invalid project: not an object')

  const p = obj as Partial<ProjectDTO>

  if (typeof p.version !== 'number') throw new Error('Invalid project: version')
  if (typeof p.width !== 'number' || typeof p.height !== 'number') throw new Error('Invalid project: size')
  if (!Array.isArray(p.palette)) throw new Error('Invalid project: palette')
  if (!Array.isArray(p.pixels)) throw new Error('Invalid project: pixels array')

  const n = p.width * p.height
  if (p.pixels.length !== n) throw new Error(`Invalid project: pixels length ${p.pixels.length} != ${n}`)

  const pixels = new Uint32Array(n)
  for (let i = 0; i < n; i++) {
    const v = p.pixels[i]
    if (typeof v !== 'number') throw new Error('Invalid project: pixels entry')
    pixels[i] = v >>> 0
  }

  const palette = normalizePalette(p.palette)

  return {
    version: p.version,
    width: p.width,
    height: p.height,
    palette,
    pixels,
  }
}
