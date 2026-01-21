// src/core/projectCodec.ts
import { PROJECT_VERSION, PALETTE_16, CUSTOM_PALETTE_SLOTS, DEFAULT_CUSTOM_COLOR } from './constants'

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
  const pal = [...PALETTE_16]
  for (let i = 0; i < CUSTOM_PALETTE_SLOTS; i++) pal.push(DEFAULT_CUSTOM_COLOR)
  return pal
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

function normalizePalette(palette: string[]): string[] {
  // v1(16색)도 받아서 custom 1칸을 뒤에 붙여줌
  if (palette.length === 16) return [...palette, DEFAULT_CUSTOM_COLOR]
  if (palette.length === 16 + CUSTOM_PALETTE_SLOTS) return palette.slice()
  throw new Error('Invalid project: palette length')
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

  const palette = normalizePalette(p.palette as string[])

  return {
    version: p.version,
    width: p.width,
    height: p.height,
    palette,
    pixels,
  }
}
