// src/ui/ReferencePanel.tsx
import { useRef } from 'react'

type Props = {
  imageUrl: string | null
  onPick: (file: File) => void
  onClear: () => void
}

export default function ReferencePanel({ imageUrl, onPick, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Reference</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button type="button" onClick={() => inputRef.current?.click()}>
          Load Image
        </button>
        <button type="button" onClick={onClear} disabled={!imageUrl}>
          Clear
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            onPick(f)
            e.currentTarget.value = ''
          }}
        />
      </div>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#fafafa',
          height: 'calc(100vh - 160px)',
          minHeight: 200,
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="reference"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        ) : (
          <div style={{ padding: 12, fontSize: 12, color: '#666' }}>
            No reference image loaded.
          </div>
        )}
      </div>
    </div>
  )
}
