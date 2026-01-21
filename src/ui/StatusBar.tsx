// src/ui/StatusBar.tsx
import { TEXT } from './i18n'
import type { Lang } from './i18n'

type Props = {
  width: number
  height: number
  zoom: number
  tool: string
  hover: { x: number; y: number } | null
  lang: Lang
}

export default function StatusBar(props: Props) {
  return (
    <div
      style={{
        borderTop: '1px solid #ddd',
        padding: '8px 12px',
        fontSize: 12,
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          Size: <b>{props.width}×{props.height}</b>
        </div>
        <div>
          Zoom: <b>{props.zoom}x</b>
        </div>
        <div>
          Tool: <b>{props.tool}</b>
        </div>
        <div>
          Grid: <b>{props.hover ? `(${props.hover.x}, ${props.hover.y})` : '(-,-)'}</b>
        </div>
      </div>

      <div style={{ textAlign: 'right', fontSize: 11, color: '#777', lineHeight: 1.25 }}>
        <div>{TEXT.licenseLine1[props.lang]}</div>
        <div>
          {TEXT.licenseLine2[props.lang]} · fatking25@kakao.com
        </div>
      </div>
    </div>
  )
}
