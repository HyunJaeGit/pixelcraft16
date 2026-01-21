// src/core/undoStack.ts
import { MAX_UNDO_STEPS } from './constants'

export class UndoStack<T> {
  private readonly limit: number
  private readonly clone: (v: T) => T
  private past: T[] = []
  private future: T[] = []

  constructor(opts: { limit?: number; clone: (v: T) => T }) {
    this.limit = opts.limit ?? MAX_UNDO_STEPS
    this.clone = opts.clone
  }

  clear(): void {
    this.past = []
    this.future = []
  }

  // 현재 상태를 "기준점"으로 저장(변경 직전에 push하는 방식 권장)
  push(state: T): void {
    this.past.push(this.clone(state))
    if (this.past.length > this.limit) this.past.shift()
    this.future = []
  }

  canUndo(): boolean {
    return this.past.length > 0
  }

  canRedo(): boolean {
    return this.future.length > 0
  }

  undo(current: T): T | null {
    if (!this.canUndo()) return null
    const prev = this.past.pop()!
    this.future.push(this.clone(current))
    return this.clone(prev)
  }

  redo(current: T): T | null {
    if (!this.canRedo()) return null
    const next = this.future.pop()!
    this.past.push(this.clone(current))
    return this.clone(next)
  }
}

// Pixels 전용 helper
export function cloneUint32Array(a: Uint32Array): Uint32Array {
  return a.slice()
}
