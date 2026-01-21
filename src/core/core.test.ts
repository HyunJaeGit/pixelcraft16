import { describe, it, expect } from 'vitest'
import { PixelGrid } from './pixelGrid'
import { applyFill, applyPencil } from './tools'
import { UndoStack, cloneUint32Array } from './undoStack'
import { makeNewProject, encodeProject, decodeProject } from './projectCodec'
import { encodePngFromArgb } from './exportPng'

describe('PixelGrid', () => {
  it('set/get works', () => {
    const g = PixelGrid.create(4, 4)
    expect(g.getPixel(0, 0)).toBe(0)
    expect(g.setPixel(1, 2, 0xff112233)).toBe(true)
    expect(g.getPixel(1, 2)).toBe(0xff112233)
    expect(g.setPixel(-1, 0, 123)).toBe(false)
  })
})

describe('tools', () => {
  it('pencil sets pixel', () => {
    const g = PixelGrid.create(3, 3)
    applyPencil(g, 2, 1, 0xff00ff00)
    expect(g.getPixel(2, 1)).toBe(0xff00ff00)
  })

  it('fill floods 4-way', () => {
    const g = PixelGrid.create(4, 4, 0xff000000)
    g.setPixel(1, 1, 0xff111111)
    g.setPixel(2, 1, 0xff111111)
    g.setPixel(1, 2, 0xff111111)
    g.setPixel(2, 2, 0xff111111)

    const filled = applyFill(g, 1, 1, 0xffaaaaaa)
    expect(filled).toBe(4)
    expect(g.getPixel(2, 2)).toBe(0xffaaaaaa)
    expect(g.getPixel(0, 0)).toBe(0xff000000)
  })
})

describe('UndoStack', () => {
  it('undo/redo snapshots', () => {
    const u = new UndoStack<Uint32Array>({ clone: cloneUint32Array, limit: 20 })
    let cur = new Uint32Array([1, 2, 3])

    u.push(cur)
    cur = new Uint32Array([9, 2, 3])

    const undone = u.undo(cur)
    expect(undone).not.toBeNull()
    expect(Array.from(undone!)).toEqual([1, 2, 3])

    const redone = u.redo(undone!)
    expect(redone).not.toBeNull()
    expect(Array.from(redone!)).toEqual([9, 2, 3])
  })
})

describe('projectCodec', () => {
  it('encode/decode roundtrip (palette includes custom slot)', () => {
    const p = makeNewProject(4, 4, 0xff000000)
    expect(p.palette.length).toBe(17)
    p.pixels[0] = 0xff123456

    const dto = encodeProject(p)
    const decoded = decodeProject(dto)
    expect(decoded.width).toBe(4)
    expect(decoded.pixels[0]).toBe(0xff123456)
    expect(decoded.palette.length).toBe(17)
  })

  it('decode v1 (16 colors) auto-appends custom slot', () => {
    const v1 = {
      version: 1,
      width: 2,
      height: 2,
      palette: new Array(16).fill('#000000'),
      pixels: [0, 0, 0, 0],
    }
    const decoded = decodeProject(v1)
    expect(decoded.palette.length).toBe(17)
  })
})

describe('exportPng', () => {
  it('png signature + IHDR exists', () => {
    const pixels = new Uint32Array(2 * 2)
    pixels[0] = 0xffff0000
    const png = encodePngFromArgb(pixels, 2, 2)
    expect(Array.from(png.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    const text = new TextDecoder().decode(png)
    expect(text.includes('IHDR')).toBe(true)
    expect(text.includes('IEND')).toBe(true)
  })
})
