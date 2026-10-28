import { useEffect, useMemo, useRef, useState } from 'react'
import type { Tool } from './Toolbar'

type Props = {
  width: number
  height: number
  pixels: Uint32Array
  zoom: number
  gridOn: boolean
  tool: Tool
  eraserSize: number
  onStrokeStart: () => void
  onStrokeEnd: () => void
  onGridPointer: (x: number, y: number, e: { shiftKey: boolean; buttons: number; button: number }) => void
  onHover: (p: { x: number; y: number } | null) => void
}

function argbToImageData(pixels: Uint32Array, w: number, h: number): ImageData {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < pixels.length; i++) {
    const v = pixels[i] >>> 0
    const o = i * 4
    data[o] = (v >>> 16) & 255
    data[o + 1] = (v >>> 8) & 255
    data[o + 2] = v & 255
    data[o + 3] = (v >>> 24) & 255
  }
  return new ImageData(data, w, h)
}

export default function CanvasView(props: Props) {
  const { width, height, pixels, zoom, gridOn } = props
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const [pointer, setPointer] = useState<{ x: number; y: number; erase: boolean } | null>(null)
  const displayW = width * zoom
  const displayH = height * zoom

  useEffect(() => {
    if (!offscreenRef.current) offscreenRef.current = document.createElement('canvas')
    offscreenRef.current.width = width
    offscreenRef.current.height = height
  }, [width, height])

  useEffect(() => {
    const canvas = canvasRef.current
    const off = offscreenRef.current
    if (!canvas || !off) return
    canvas.width = displayW
    canvas.height = displayH
    const ctx = canvas.getContext('2d')
    const offCtx = off.getContext('2d')
    if (!ctx || !offCtx) return

    offCtx.putImageData(argbToImageData(pixels, width, height), 0, 0)
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, displayW, displayH)
    ctx.drawImage(off, 0, 0, width, height, 0, 0, displayW, displayH)

    if (gridOn && zoom >= 8) {
      ctx.save()
      ctx.globalAlpha = 0.35
      ctx.beginPath()
      for (let x = 0; x <= width; x++) {
        const px = x * zoom + 0.5
        ctx.moveTo(px, 0)
        ctx.lineTo(px, displayH)
      }
      for (let y = 0; y <= height; y++) {
        const py = y * zoom + 0.5
        ctx.moveTo(0, py)
        ctx.lineTo(displayW, py)
      }
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
    }
  }, [pixels, width, height, zoom, gridOn, displayW, displayH])

  const rectMemo = useMemo(() => ({ w: displayW, h: displayH }), [displayW, displayH])
  const showEraserCursor = pointer !== null && (props.tool === 'eraser' || (props.tool === 'pencil' && pointer.erase))
  const rawCursorX = pointer ? pointer.x - Math.floor(props.eraserSize / 2) : 0
  const rawCursorY = pointer ? pointer.y - Math.floor(props.eraserSize / 2) : 0
  const cursorX = Math.max(0, rawCursorX)
  const cursorY = Math.max(0, rawCursorY)
  const cursorWidth = Math.max(0, Math.min(width, rawCursorX + props.eraserSize) - cursorX)
  const cursorHeight = Math.max(0, Math.min(height, rawCursorY + props.eraserSize) - cursorY)

  function toGrid(e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } | null {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const x = Math.floor(sx / zoom)
    const y = Math.floor(sy / zoom)
    if (x < 0 || y < 0 || x >= width || y >= height) return null
    return { x, y }
  }

  return (
    <div style={{ padding: 12, width: '100%', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', width: rectMemo.w + 2, height: rectMemo.h + 2 }}>
        <canvas
          ref={canvasRef}
          style={{
            width: rectMemo.w,
            height: rectMemo.h,
            border: '1px solid #ccc',
            touchAction: 'none',
            cursor: showEraserCursor ? 'none' : props.tool === 'eyedropper' ? 'copy' : 'crosshair',
            display: 'block',
          }}
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            const gp = toGrid(e)
            if (!gp) return
            e.currentTarget.setPointerCapture(e.pointerId)
            const erase = props.tool === 'eraser' || (e.buttons & 2) === 2 || e.shiftKey
            setPointer({ ...gp, erase })
            props.onStrokeStart()
            props.onGridPointer(gp.x, gp.y, { shiftKey: e.shiftKey, buttons: e.buttons, button: e.button })
            if (props.tool === 'eyedropper') props.onStrokeEnd()
          }}
          onPointerMove={(e) => {
            const gp = toGrid(e)
            if (!gp) {
              setPointer(null)
              props.onHover(null)
              return
            }
            props.onHover(gp)
            setPointer({ ...gp, erase: props.tool === 'eraser' || (e.buttons & 2) === 2 || e.shiftKey })
            if (props.tool === 'eyedropper') return
            if (e.buttons !== 0) props.onGridPointer(gp.x, gp.y, { shiftKey: e.shiftKey, buttons: e.buttons, button: e.button })
          }}
          onPointerUp={() => props.onStrokeEnd()}
          onPointerCancel={() => props.onStrokeEnd()}
          onPointerLeave={() => {
            setPointer(null)
            props.onHover(null)
          }}
        />
        {showEraserCursor && pointer && cursorWidth > 0 && cursorHeight > 0 && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 1 + cursorX * zoom,
              top: 1 + cursorY * zoom,
              width: cursorWidth * zoom,
              height: cursorHeight * zoom,
              boxSizing: 'border-box',
              border: '1px solid white',
              outline: '1px solid #111',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}
      </div>
    </div>
  )
}
