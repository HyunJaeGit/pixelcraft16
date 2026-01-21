// src/ui/i18n.ts
export type Lang = 'ko' | 'en'

export const TEXT = {
  title: { ko: 'PixelCraft 16', en: 'PixelCraft 16' },

  fileName: { ko: '파일명', en: 'File name' },

  pencil: { ko: '연필', en: 'Pencil' },
  fill: { ko: '채우기', en: 'Fill' },

  zoom: { ko: '확대', en: 'Zoom' },
  grid: { ko: '격자', en: 'Grid' },
  newFile: { ko: '새 파일', en: 'New' },

  undo: { ko: '되돌리기', en: 'Undo' },
  redo: { ko: '다시 실행', en: 'Redo' },

  exportPng: { ko: 'PNG 내보내기', en: 'Export PNG' },
  exportJson: { ko: 'JSON 내보내기', en: 'Export JSON' },
  importJson: { ko: 'JSON 불러오기', en: 'Import JSON' },

  paletteTitle: { ko: '팔레트', en: 'Palette' },
  customTitle: { ko: '커스텀(1칸)', en: 'Custom (1 slot)' },
  hexLabel: { ko: 'HEX (#RRGGBB)', en: 'HEX (#RRGGBB)' },

  toolsTitle: { ko: '도구', en: 'Tools' },
  eyedropper: { ko: '스포이드', en: 'Eyedropper' },
  eyedropperOn: { ko: '스포이드 (ON)', en: 'Eyedropper (ON)' },

  selectedTitle: { ko: '선택된 색', en: 'Selected' },

  hintUndo: { ko: '되돌리기: Ctrl+Z', en: 'Undo: Ctrl+Z' },
  hintRedo: { ko: '다시 실행: Ctrl+Y / Ctrl+Shift+Z', en: 'Redo: Ctrl+Y / Ctrl+Shift+Z' },
  hintErase: { ko: '지우개: 우클릭 / Shift', en: 'Erase: Right click / Shift' },

  licenseLine1: {
    ko: '이 툴은 개인/비상업적 용도로 자유롭게 사용할 수 있습니다.',
    en: 'This tool is free for personal and non-commercial use.',
  },
  licenseLine2: {
    ko: '© 2026 팻킹(DevKay). 소스코드 무단 복사·수정·재배포 금지',
    en: '© 2026 FatKing (DevKay). Source code copying, modification, redistribution prohibited.',
  },
} as const
