// src/core/constants.ts
export const PROJECT_VERSION = 2 as const

export const PALETTE_16: readonly string[] = [
  '#000000', '#ffffff', '#9d9d9d', '#4a4a4a',
  '#ff0000', '#ffa500', '#ffff00', '#00ff00',
  '#00ffff', '#0000ff', '#8000ff', '#ff00ff',
  '#8b4513', '#f4a460', '#008080', '#2f4f4f',
] as const

// Custom palette slots (1개만)
export const CUSTOM_PALETTE_SLOTS = 1 as const
export const DEFAULT_CUSTOM_COLOR = '#000000' as const

export const CANVAS_SIZES = [16, 32, 64, 128] as const
export const MAX_UNDO_STEPS = 20 as const

export const DEFAULT_SIZE = 32 as const
export const DEFAULT_COLOR_INDEX = 0 as const
export const ERASER_COLOR_ARGB = 0x00000000
