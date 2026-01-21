// src/core/exportPng.ts
// ARGB Uint32Array -> PNG (RGBA) Uint8Array
// Pure TS: DOM/Canvas 의존 없음

function u32be(n: number): Uint8Array {
  return new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255])
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i]
    for (let k = 0; k < 8; k++) {
      const mask = -(crc & 1)
      crc = (crc >>> 1) ^ (0xedb88320 & mask)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function adler32(bytes: Uint8Array): number {
  let a = 1
  let b = 0
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % 65521
    b = (b + a) % 65521
  }
  return ((b << 16) | a) >>> 0
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((s, p) => s + p.length, 0)
  const out = new Uint8Array(len)
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const t = new TextEncoder().encode(type)
  const len = u32be(data.length)
  const body = concat(t, data)
  const crc = u32be(crc32(body))
  return concat(len, body, crc)
}

// zlib wrapper with "stored" (uncompressed) DEFLATE blocks
function zlibStored(data: Uint8Array): Uint8Array {
  // zlib header: CMF/FLG (deflate, 32K window)
  const cmf = 0x78
  const flg = 0x01 // check bits 맞춰짐(가벼운 값)
  const header = new Uint8Array([cmf, flg])

  const blocks: Uint8Array[] = []
  let pos = 0
  while (pos < data.length) {
    const remaining = data.length - pos
    const size = Math.min(0xffff, remaining)
    const final = (pos + size >= data.length) ? 1 : 0

    // block header: BFINAL + BTYPE(00)
    const b0 = final // 0000000|BFINAL
    const len = size
    const nlen = (~len) & 0xffff
    const block = new Uint8Array(1 + 2 + 2 + size)
    block[0] = b0
    block[1] = len & 255
    block[2] = (len >>> 8) & 255
    block[3] = nlen & 255
    block[4] = (nlen >>> 8) & 255
    block.set(data.subarray(pos, pos + size), 5)

    blocks.push(block)
    pos += size
  }

  const ad = u32be(adler32(data))
  return concat(header, ...blocks, ad)
}

export function encodePngFromArgb(
  pixelsARGB: Uint32Array,
  width: number,
  height: number,
  opts?: { scale?: number; transparentBackground?: boolean }
): Uint8Array {
  const scale = Math.max(1, opts?.scale ?? 1)
  const outW = width * scale
  const outH = height * scale

  // raw scanlines: each row = filter(0) + RGBA*outW
  const rowLen = 1 + outW * 4
  const raw = new Uint8Array(rowLen * outH)

  let dst = 0
  for (let y = 0; y < height; y++) {
    for (let sy = 0; sy < scale; sy++) {
      raw[dst++] = 0 // filter type 0
      for (let x = 0; x < width; x++) {
        const argb = pixelsARGB[y * width + x] >>> 0
        const a = (argb >>> 24) & 255
        const r = (argb >>> 16) & 255
        const g = (argb >>> 8) & 255
        const b = argb & 255

        for (let sx = 0; sx < scale; sx++) {
          raw[dst++] = r
          raw[dst++] = g
          raw[dst++] = b
          raw[dst++] = a
        }
      }
    }
  }

  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdr = new Uint8Array(13)
  ihdr.set(u32be(outW), 0)
  ihdr.set(u32be(outH), 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  const idat = zlibStored(raw)

  return concat(
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', new Uint8Array())
  )
}
