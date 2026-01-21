// src/core/storage.ts
import type { ProjectData } from './projectCodec'
import { encodeProject, decodeProject } from './projectCodec'

// v2로 변경 (팔레트 슬롯 추가로 포맷 변경)
export const DEFAULT_STORAGE_KEY = 'pixelcraft16.project.v2'

export function saveToStorage(project: ProjectData, opts?: { key?: string; storage?: Storage }): void {
  const key = opts?.key ?? DEFAULT_STORAGE_KEY
  const storage = opts?.storage ?? (globalThis as any).localStorage
  if (!storage) return

  const dto = encodeProject(project)
  storage.setItem(key, JSON.stringify(dto))
}

export function loadFromStorage(opts?: { key?: string; storage?: Storage }): ProjectData | null {
  const key = opts?.key ?? DEFAULT_STORAGE_KEY
  const storage = opts?.storage ?? (globalThis as any).localStorage
  if (!storage) return null

  const raw = storage.getItem(key)
  if (!raw) return null

  try {
    return decodeProject(raw)
  } catch {
    return null
  }
}
