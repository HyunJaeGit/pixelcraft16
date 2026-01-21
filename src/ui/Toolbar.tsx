// src/ui/Toolbar.tsx
import { useRef } from 'react'
import { TEXT } from './i18n'
import type { Lang } from './i18n'

export type Tool = 'pencil' | 'fill' | 'eyedropper'

type Props = {
  lang: Lang
  setLang: (l: Lang) => void

  fileName: string
  setFileName: (v: string) => void

  tool: Tool
  setTool: (t: Tool) => void

  zoom: number
  setZoom: (z: number) => void
  zoomOptions: number[]

  gridOn: boolean
  setGridOn: (v: boolean) => void

  sizeOptions: number[]
  onNewProject: (size: number) => void

  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean

  onExportPng: () => void
  onExportJson: () => void
  onImportJson: (file: File) => void
}

export default function Toolbar(props: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderBottom: '1px solid #ddd',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ fontWeight: 800 }}>{TEXT.title[props.lang]}</div>

      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        {TEXT.fileName[props.lang]}:
        <input
          value={props.fileName}
          onChange={(e) => props.setFileName(e.target.value)}
          placeholder="my_icon"
          style={{ width: 160, padding: '6px 8px' }}
        />
      </label>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => props.setTool('pencil')}
          style={{ padding: '6px 10px', border: props.tool === 'pencil' ? '2px solid #111' : '1px solid #bbb' }}
        >
          {TEXT.pencil[props.lang]}
        </button>

        <button
          type="button"
          onClick={() => props.setTool('fill')}
          style={{ padding: '6px 10px', border: props.tool === 'fill' ? '2px solid #111' : '1px solid #bbb' }}
        >
          {TEXT.fill[props.lang]}
        </button>
      </div>

      <label style={{ fontSize: 12 }}>
        {TEXT.zoom[props.lang]}:{' '}
        <select value={props.zoom} onChange={(e) => props.setZoom(Number(e.target.value))}>
          {props.zoomOptions.map((z) => (
            <option key={z} value={z}>
              {z}x
            </option>
          ))}
        </select>
      </label>

      <label style={{ fontSize: 12 }}>
        <input type="checkbox" checked={props.gridOn} onChange={(e) => props.setGridOn(e.target.checked)} />{' '}
        {TEXT.grid[props.lang]}
      </label>

      <label style={{ fontSize: 12 }}>
        {TEXT.newFile[props.lang]}:{' '}
        <select onChange={(e) => props.onNewProject(Number(e.target.value))} defaultValue="">
          <option value="" disabled>
            size
          </option>
          {props.sizeOptions.map((s) => (
            <option key={s} value={s}>
              {s}×{s}
            </option>
          ))}
        </select>
      </label>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button type="button" onClick={props.onUndo} disabled={!props.canUndo} title="Ctrl+Z">
          {TEXT.undo[props.lang]}
        </button>
        <button type="button" onClick={props.onRedo} disabled={!props.canRedo} title="Ctrl+Y / Ctrl+Shift+Z">
          {TEXT.redo[props.lang]}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button type="button" onClick={props.onExportPng}>
          {TEXT.exportPng[props.lang]}
        </button>
        <button type="button" onClick={props.onExportJson}>
          {TEXT.exportJson[props.lang]}
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>
          {TEXT.importJson[props.lang]}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            props.onImportJson(f)
            e.currentTarget.value = ''
          }}
        />
      </div>

      {/* language toggle */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        <button
          type="button"
          onClick={() => props.setLang('ko')}
          style={{
            padding: '6px 10px',
            fontWeight: props.lang === 'ko' ? 700 : 400,
            border: props.lang === 'ko' ? '2px solid #111' : '1px solid #bbb',
          }}
        >
          KO
        </button>
        <button
          type="button"
          onClick={() => props.setLang('en')}
          style={{
            padding: '6px 10px',
            fontWeight: props.lang === 'en' ? 700 : 400,
            border: props.lang === 'en' ? '2px solid #111' : '1px solid #bbb',
          }}
        >
          EN
        </button>
      </div>
    </div>
  )
}
