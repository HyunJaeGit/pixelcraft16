// src/ui/EditorPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import CanvasView from './CanvasView'
import PalettePanel from './PalettePanel'
import Toolbar from './Toolbar'
import type { Tool } from './Toolbar'
import StatusBar from './StatusBar'
import ReferencePanel from './ReferencePanel'
import { TEXT } from './i18n'
import type { Lang } from './i18n'

import {
  CANVAS_SIZES,
  DEFAULT_SIZE,
  MAX_UNDO_STEPS,
  makeNewProject,
  encodeProject,
  decodeProject,
  saveToStorage,
  loadFromStorage,
  DEFAULT_STORAGE_KEY,
  UndoStack,
  cloneUint32Array,
  PixelGrid,
  applyPencil,
  applyFill,
  encodePngFromArgb,
} from '../core'

type Zoom = 8 | 16 | 24 | 32
const ZOOMS: Zoom[] = [8, 16, 24, 32]

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function downloadText(filename: string, text: string, mime = 'application/json') {
  downloadBlob(filename, new Blob([text], { type: mime }))
}

function hexToArgb(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) & 255
  const g = parseInt(h.slice(2, 4), 16) & 255
  const b = parseInt(h.slice(4, 6), 16) & 255
  return ((255 << 24) | (r << 16) | (g << 8) | b) >>> 0
}

function argbToHex(argb: number): string {
  const r = (argb >>> 16) & 255
  const g = (argb >>> 8) & 255
  const b = argb & 255
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function nearestPaletteIndex(palette: string[], argb: number): number {
  const target = argbToHex(argb).toLowerCase()
  const exact = palette.findIndex((p) => p.toLowerCase() === target)
  if (exact >= 0) return exact

  const tr = (argb >>> 16) & 255
  const tg = (argb >>> 8) & 255
  const tb = argb & 255

  let best = 0
  let bestD = Number.POSITIVE_INFINITY
  for (let i = 0; i < palette.length; i++) {
    const c = hexToArgb(palette[i])
    const r = (c >>> 16) & 255
    const g = (c >>> 8) & 255
    const b = c & 255
    const dr = r - tr
    const dg = g - tg
    const db = b - tb
    const d = dr * dr + dg * dg + db * db
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

function sanitizeBaseName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'pixelcraft16'
  const noExt = trimmed.replace(/\.[a-zA-Z0-9]+$/, '')
  return noExt.replace(/[\\/:*?"<>|]+/g, '_')
}

function isValidHex6(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}

export default function EditorPage() {
  // i18n
  const [lang, setLang] = useState<Lang>('ko')

  // file name
  const [fileName, setFileName] = useState<string>('pixelcraft16')

  const [width, setWidth] = useState<number>(DEFAULT_SIZE)
  const [height, setHeight] = useState<number>(DEFAULT_SIZE)
  const [palette, setPalette] = useState<string[]>(() => [])
  const [pixels, setPixels] = useState<Uint32Array>(() => new Uint32Array(DEFAULT_SIZE * DEFAULT_SIZE))

  const [tool, setTool] = useState<Tool>('pencil')
  const [colorIndex, setColorIndex] = useState<number>(0)
  const [zoom, setZoom] = useState<Zoom>(16)
  const [gridOn, setGridOn] = useState<boolean>(true)

  const [hover, setHover] = useState<{ x: number; y: number } | null>(null)
  const [refImageUrl, setRefImageUrl] = useState<string | null>(null)

  const customHex = palette[16] ?? '#000000'

  const pixelsRef = useRef<Uint32Array>(pixels)
  useEffect(() => {
    pixelsRef.current = pixels
  }, [pixels])

  const undoRef = useRef(
    new UndoStack<Uint32Array>({
      limit: MAX_UNDO_STEPS,
      clone: cloneUint32Array,
    })
  )

  const strokePushedRef = useRef(false)
  const dirtyRef = useRef(false)

  useEffect(() => {
    const loaded = loadFromStorage({ key: DEFAULT_STORAGE_KEY })
    if (loaded) {
      setWidth(loaded.width)
      setHeight(loaded.height)
      setPalette(loaded.palette)
      setPixels(loaded.pixels)
      undoRef.current.clear()
      dirtyRef.current = false
      return
    }

    const fresh = makeNewProject(DEFAULT_SIZE, DEFAULT_SIZE, 0x00000000)
    setWidth(fresh.width)
    setHeight(fresh.height)
    setPalette(fresh.palette)
    setPixels(fresh.pixels)
    undoRef.current.clear()
    dirtyRef.current = false
  }, [])

  useEffect(() => {
    if (palette.length < 16) return
    const id = window.setTimeout(() => {
      saveToStorage({ version: 2, width, height, palette, pixels }, { key: DEFAULT_STORAGE_KEY })
      dirtyRef.current = false
    }, 250)
    return () => window.clearTimeout(id)
  }, [width, height, palette, pixels])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const tag = el?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || (el as any)?.isContentEditable) return

      const ctrl = e.ctrlKey || e.metaKey
      if (!ctrl) return

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
        return
      }
      if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentColorArgb = useMemo(() => {
    const hex = palette[colorIndex] ?? '#000000'
    return hexToArgb(hex)
  }, [palette, colorIndex])

  function confirmIfDirty(actionName: string): boolean {
    if (!dirtyRef.current && !undoRef.current.canUndo()) return true
    return window.confirm(`${actionName}을(를) 진행하면 현재 작업을 잃을 수 있습니다. 계속할까요?`)
  }

  function newProject(size: number) {
    if (!confirmIfDirty('New File')) return
    const p = makeNewProject(size, size, 0x00000000)
    setWidth(p.width)
    setHeight(p.height)
    setPalette(p.palette)
    setPixels(p.pixels)
    undoRef.current.clear()
    dirtyRef.current = false
    setTool('pencil')
    setFileName('pixelcraft16')
  }

  function pushUndoOnce() {
    if (strokePushedRef.current) return
    undoRef.current.push(pixelsRef.current)
    strokePushedRef.current = true
  }

  function commitPixels(next: Uint32Array) {
    dirtyRef.current = true
    setPixels(next)
  }

  function applyAt(x: number, y: number, mode: 'draw' | 'erase') {
    if (x < 0 || y < 0 || x >= width || y >= height) return

    const base = pixelsRef.current
    const next = base.slice()
    const grid = new PixelGrid(width, height, next)

    if (tool === 'eyedropper') {
      const picked = grid.getPixel(x, y) >>> 0
      if (((picked >>> 24) & 255) === 0) return
      const idx = nearestPaletteIndex(palette, picked)
      setColorIndex(idx)
      setTool('pencil')
      return
    }

    if (tool === 'fill') {
      pushUndoOnce()
      applyFill(grid, x, y, mode === 'erase' ? 0x00000000 : currentColorArgb)
      commitPixels(next)
      return
    }

    pushUndoOnce()
    applyPencil(grid, x, y, mode === 'erase' ? 0x00000000 : currentColorArgb)
    commitPixels(next)
  }

  function onStrokeStart() {
    strokePushedRef.current = false
  }

  function onStrokeEnd() {
    strokePushedRef.current = false
  }

  function onGridPointer(x: number, y: number, e: { shiftKey: boolean; buttons: number; button: number }) {
    setHover({ x, y })

    if (tool === 'eyedropper') {
      applyAt(x, y, 'draw')
      return
    }

    const isRight = (e.buttons & 2) === 2 || e.button === 2
    const erase = isRight || e.shiftKey
    const mode: 'draw' | 'erase' = erase ? 'erase' : 'draw'
    applyAt(x, y, mode)
  }

  function handleUndo() {
    const cur = pixelsRef.current
    const prev = undoRef.current.undo(cur)
    if (!prev) return
    dirtyRef.current = true
    setPixels(prev)
  }

  function handleRedo() {
    const cur = pixelsRef.current
    const next = undoRef.current.redo(cur)
    if (!next) return
    dirtyRef.current = true
    setPixels(next)
  }

  function baseName(): string {
    return sanitizeBaseName(fileName)
  }

  function exportPng(scale: number) {
    const png = encodePngFromArgb(pixelsRef.current, width, height, { scale })

    // TS BlobPart 이슈 회피: 새 ArrayBuffer로 복사
    const copy = new Uint8Array(png.byteLength)
    copy.set(png)

    downloadBlob(`${baseName()}_${width}x${height}@${scale}x.png`, new Blob([copy], { type: 'image/png' }))
  }

  function exportJsonDownload() {
    const dto = encodeProject({ version: 2, width, height, palette, pixels: pixelsRef.current })
    downloadText(`${baseName()}_${width}x${height}.json`, JSON.stringify(dto))
  }

  async function importJsonFile(file: File) {
    if (!confirmIfDirty('Import')) return

    const text = await file.text()
    const decoded = decodeProject(text)

    setWidth(decoded.width)
    setHeight(decoded.height)
    setPalette(decoded.palette)
    setPixels(decoded.pixels)
    undoRef.current.clear()
    dirtyRef.current = false
    setTool('pencil')

    setFileName(sanitizeBaseName(file.name))
  }

  function onChangeCustomHex(hex: string) {
    if (!isValidHex6(hex)) return

    setPalette((prev) => {
      const next = prev.slice()
      if (next.length < 17) return prev
      next[16] = hex
      return next
    })
  }

  async function onPickReference(file: File) {
    const url = URL.createObjectURL(file)
    setRefImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
  }

  function onClearReference() {
    setRefImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  const canUndo = undoRef.current.canUndo()
  const canRedo = undoRef.current.canRedo()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', minHeight: 0 }}>
      <Toolbar
        lang={lang}
        setLang={setLang}
        fileName={fileName}
        setFileName={setFileName}
        tool={tool}
        setTool={setTool}
        zoom={zoom}
        setZoom={(z) => setZoom(z as Zoom)}
        zoomOptions={ZOOMS}
        gridOn={gridOn}
        setGridOn={setGridOn}
        sizeOptions={CANVAS_SIZES as unknown as number[]}
        onNewProject={newProject}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onExportPng={() => exportPng(16)}
        onExportJson={exportJsonDownload}
        onImportJson={importJsonFile}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ width: 260, borderRight: '1px solid #ddd', padding: 12, overflow: 'auto' }}>
          <PalettePanel
            lang={lang}
            palette={palette}
            selectedIndex={colorIndex}
            onSelect={setColorIndex}
            tool={tool}
            setTool={setTool}
            customHex={customHex}
            onChangeCustomHex={onChangeCustomHex}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          <CanvasView
            width={width}
            height={height}
            pixels={pixels}
            zoom={zoom}
            gridOn={gridOn}
            tool={tool}
            onStrokeStart={onStrokeStart}
            onStrokeEnd={onStrokeEnd}
            onGridPointer={onGridPointer}
            onHover={setHover}
          />
        </div>

        <div style={{ width: 360, borderLeft: '1px solid #ddd', overflow: 'auto' }}>
          <ReferencePanel imageUrl={refImageUrl} onPick={onPickReference} onClear={onClearReference} />
        </div>
      </div>

      <StatusBar width={width} height={height} zoom={zoom} tool={tool} hover={hover} lang={lang} />
    </div>
  )
}
