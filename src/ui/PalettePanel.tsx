import { useEffect, useState } from 'react'
import { MAX_PALETTE_COLORS } from '../core/constants'
import { TEXT } from './i18n'
import type { Lang } from './i18n'
import type { Tool } from './Toolbar'

type Props = {
  lang: Lang
  palette: string[]
  selectedIndex: number
  onSelect: (idx: number) => void
  tool: Tool
  setTool: (t: Tool) => void
  onChangeColor: (hex: string) => void
  onAddColor: (hex: string) => void
  onRemoveColor: (idx: number) => void
}

function normalizeHex(input: string): string {
  const value = input.trim()
  if (!value) return ''
  return value.startsWith('#') ? value : `#${value}`
}

function isValidHex6(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}

export default function PalettePanel({
  lang,
  palette,
  selectedIndex,
  onSelect,
  tool,
  setTool,
  onChangeColor,
  onAddColor,
  onRemoveColor,
}: Props) {
  const selectedHex = palette[selectedIndex] ?? palette[0] ?? '#000000'
  const [draftHex, setDraftHex] = useState(selectedHex)

  useEffect(() => setDraftHex(selectedHex), [selectedIndex, selectedHex])

  function updateDraft(value: string) {
    const normalized = normalizeHex(value)
    setDraftHex(normalized)
  }

  const validDraft = isValidHex6(draftHex)
  const paletteFull = palette.length >= MAX_PALETTE_COLORS

  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{TEXT.paletteTitle[lang]} ({palette.length}/{MAX_PALETTE_COLORS})</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {palette.map((hex, i) => (
          <button
            key={`${i}-${hex}`}
            type="button"
            onClick={() => onSelect(i)}
            title={`${i + 1}: ${hex}`}
            aria-label={`${TEXT.color[lang]} ${i + 1} ${hex}`}
            aria-pressed={i === selectedIndex}
            style={{ width: 44, height: 44, background: hex, border: i === selectedIndex ? '3px solid #111' : '1px solid #bbb', borderRadius: 8, cursor: 'pointer' }}
          />
        ))}
      </div>

      <div style={{ marginTop: 12, fontWeight: 700 }}>{TEXT.colorEditor[lang]}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <input type="color" value={validDraft ? draftHex : selectedHex} onChange={(e) => updateDraft(e.target.value)} aria-label={TEXT.colorPicker[lang]} style={{ width: 44, height: 40, padding: 2, cursor: 'pointer' }} />
        <input value={draftHex} onChange={(e) => updateDraft(e.target.value)} placeholder="#33AAFF" aria-label={TEXT.hexLabel[lang]} style={{ width: 120, padding: '6px 8px' }} />
      </div>
      {!validDraft && <div style={{ fontSize: 12, color: '#b00', marginTop: 4 }}>{TEXT.invalidHex[lang]}</div>}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        <button type="button" onClick={() => validDraft && onChangeColor(draftHex.toLowerCase())} disabled={!validDraft}>{TEXT.updateColor[lang]}</button>
        <button type="button" onClick={() => validDraft && onAddColor(draftHex)} disabled={!validDraft || paletteFull}>{TEXT.addColor[lang]}</button>
        <button type="button" onClick={() => onRemoveColor(selectedIndex)} disabled={palette.length <= 1}>{TEXT.removeColor[lang]}</button>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>{TEXT.selectedTitle[lang]}: {selectedHex}</div>
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #ddd' }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{TEXT.toolsTitle[lang]}</div>
        <button type="button" onClick={() => setTool(tool === 'eyedropper' ? 'pencil' : 'eyedropper')} style={{ width: '100%', padding: '8px 10px', fontWeight: tool === 'eyedropper' ? 700 : 400, border: tool === 'eyedropper' ? '2px solid #111' : '1px solid #bbb', borderRadius: 10, cursor: 'pointer' }} title="Pick color from canvas">
          {tool === 'eyedropper' ? TEXT.eyedropperOn[lang] : TEXT.eyedropper[lang]}
        </button>
        <div style={{ marginTop: 10, fontSize: 12, color: '#666', lineHeight: 1.4 }}>
          <div>{TEXT.hintUndo[lang]}</div><div>{TEXT.hintRedo[lang]}</div><div>{TEXT.hintErase[lang]}</div>
        </div>
      </div>
    </div>
  )
}
