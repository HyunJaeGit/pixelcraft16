// src/ui/PalettePanel.tsx
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

  customHex: string
  onChangeCustomHex: (hex: string) => void
}

function normalizeHex(input: string): string {
  const v = input.trim()
  if (!v) return ''
  return v.startsWith('#') ? v : `#${v}`
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
  customHex,
  onChangeCustomHex,
}: Props) {
  const baseColors = palette.slice(0, 16)
  const customIndex = 16
  const selectedHex = palette[selectedIndex] ?? '#000000'

  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{TEXT.paletteTitle[lang]}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {baseColors.map((hex, i) => {
          const selected = i === selectedIndex
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              title={`${i}: ${hex}`}
              style={{
                width: 44,
                height: 44,
                background: hex,
                border: selected ? '3px solid #111' : '1px solid #bbb',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            />
          )
        })}
      </div>

      <div style={{ marginTop: 12, fontWeight: 700 }}>{TEXT.customTitle[lang]}</div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <button
          type="button"
          onClick={() => onSelect(customIndex)}
          title={`Custom: ${customHex}`}
          style={{
            width: 44,
            height: 44,
            background: isValidHex6(customHex) ? customHex : '#ffffff',
            border: selectedIndex === customIndex ? '3px solid #111' : '1px solid #bbb',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, color: '#555' }}>{TEXT.hexLabel[lang]}</label>
          <input
            value={customHex}
            onChange={(e) => onChangeCustomHex(normalizeHex(e.target.value))}
            placeholder="#33AAFF"
            style={{ width: 140, padding: '6px 8px' }}
          />
          {!customHex || isValidHex6(customHex) ? null : (
            <div style={{ fontSize: 12, color: '#b00' }}>Invalid hex. Example: #33AAFF</div>
          )}
        </div>
      </div>

      {/* tools + selected */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #ddd' }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{TEXT.toolsTitle[lang]}</div>

        <button
          type="button"
          onClick={() => setTool(tool === 'eyedropper' ? 'pencil' : 'eyedropper')}
          style={{
            width: '100%',
            padding: '8px 10px',
            fontWeight: tool === 'eyedropper' ? 700 : 400,
            border: tool === 'eyedropper' ? '2px solid #111' : '1px solid #bbb',
            borderRadius: 10,
            cursor: 'pointer',
          }}
          title="Pick color from canvas"
        >
          {tool === 'eyedropper' ? TEXT.eyedropperOn[lang] : TEXT.eyedropper[lang]}
        </button>

        <div style={{ marginTop: 12, fontWeight: 700 }}>{TEXT.selectedTitle[lang]}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span
            style={{
              width: 16,
              height: 16,
              background: selectedHex,
              border: '1px solid #999',
              display: 'inline-block',
              borderRadius: 4,
            }}
          />
          <div style={{ fontSize: 12, color: '#666' }}>{selectedHex}</div>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: '#666', lineHeight: 1.4 }}>
          <div>{TEXT.hintUndo[lang]}</div>
          <div>{TEXT.hintRedo[lang]}</div>
          <div>{TEXT.hintErase[lang]}</div>
        </div>
      </div>
    </div>
  )
}
