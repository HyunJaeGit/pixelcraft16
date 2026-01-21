// src/ui/CanvasView.tsx
import { useEffect, useMemo, useRef } from 'react'
import type { Tool } from './Toolbar'

type Props = {
  width: number
  height: number
  pixels: Uint32Array // ARGB
  zoom: number
  gridOn: boolean
  tool: Tool

  onStrokeStart: () => void
  onStrokeEnd: () => void

  onGridPointer: (x: number, y: number, e: { shiftKey: boolean; buttons: number; button: number }) => void
  onHover: (p: { x: number; y: number } | null) => void
}

function argbToImageData(pixels: Uint32Array, w: number, h: number): ImageData {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < pixels.length; i++) {
    const v = pixels[i] >>> 0
    const a = (v >>> 24) & 255
    const r = (v >>> 16) & 255
    const g = (v >>> 8) & 255
    const b = v & 255
    const o = i * 4
    data[o + 0] = r
    data[o + 1] = g
    data[o + 2] = b
    data[o + 3] = a
  }
  return new ImageData(data, w, h)
}

export default function CanvasView(props: Props) {
  const { width, height, pixels, zoom, gridOn } = props
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)

  const displayW = width * zoom
  const displayH = height * zoom

  useEffect(() => {
    if (!offscreenRef.current) offscreenRef.current = document.createElement('canvas')
    const off = offscreenRef.current
    off.width = width
    off.height = height
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

    const img = argbToImageData(pixels, width, height)
    offCtx.putImageData(img, 0, 0)

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
    // ✅ zoom 커져도 이 영역 안에서만 스크롤되도록
    <div
      style={{
        padding: 12,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: rectMemo.w,
          height: rectMemo.h,
          border: '1px solid #ccc',
          touchAction: 'none',
          cursor: props.tool === 'eyedropper' ? 'copy' : 'crosshair',
          display: 'block',
        }}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          const gp = toGrid(e)
          if (!gp) return
          ;(e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId)

          props.onStrokeStart()
          props.onGridPointer(gp.x, gp.y, { shiftKey: e.shiftKey, buttons: e.buttons, button: e.button })

          // eyedropper는 클릭 1회 동작이므로 즉시 종료
          if (props.tool === 'eyedropper') props.onStrokeEnd()
        }}
        onPointerMove={(e) => {
          const gp = toGrid(e)
          if (!gp) {
            props.onHover(null)
            return
          }
          props.onHover(gp)

          if (props.tool === 'eyedropper') return

          if (e.buttons !== 0) {
            props.onGridPointer(gp.x, gp.y, { shiftKey: e.shiftKey, buttons: e.buttons, button: e.button })
          }
        }}
        onPointerUp={() => props.onStrokeEnd()}
        onPointerCancel={() => props.onStrokeEnd()}
        onPointerLeave={() => props.onHover(null)}
      />
    </div>
  )
}
