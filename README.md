# PixelCraft 16

**16색 제한 픽셀 아이콘 메이커 (정적 웹 툴)**  
React + TypeScript + Vite 기반, 서버 없이 GitHub Pages에서 동작합니다.

---

## 🔹 프로젝트 소개

**PixelCraft 16**은  
복잡한 기능을 제거하고, **빠르고 안정적인 픽셀 작업 경험**에 집중한  
**16색 제한 픽셀 아이콘/스프라이트 제작 웹 툴**입니다.

- 서버, 로그인, 계정 ❌
- 설치 필요 ❌
- 브라우저만 있으면 즉시 사용 ⭕

> 이 프로젝트는 “기능 많은 에디터”가 아니라  
> **언제나 열 수 있는 작은 픽셀 작업대**를 목표로 합니다.

---

## ✨ 주요 기능

### 🎨 편집 기능
- 캔버스 크기: **16×16 / 32×32 / 64×64 / 128×128**
- 고정 **16색 팔레트 + 커스텀 색상 1칸**
- 도구
  - 연필
  - 채우기
  - 스포이드
- 격자(Grid) ON / OFF
- 확대(Zoom): 8x / 16x / 24x / 32x

### 💾 저장 & 내보내기
- PNG Export
- JSON Export / Import
- 자동 저장 (LocalStorage)
- 작업 파일명 지정 가능

### ⏪ 상태 관리
- Undo / Redo (최소 20 스텝)
- 단축키 지원
  - Undo: `Ctrl + Z`
  - Redo: `Ctrl + Y` / `Ctrl + Shift + Z`

### 🌐 다국어
- 한국어 / 영어 전환 (상단 툴바)

---

## 🧱 기술 스택

### Frontend
- React 18
- TypeScript
- Vite
- HTML5 Canvas 2D API

### Core 설계
- Pure TypeScript (UI와 분리)
- 픽셀 데이터: `Uint32Array (ARGB)`
- 모든 도구는 **Grid Space 좌표계**에서만 동작

### 배포
- GitHub Pages (정적 호스팅)
- 서버 / API / DB 사용 없음

---

## 📁 프로젝트 구조

```text
src/
 ├─ core/        # 픽셀 엔진 (Pure TS)
 │   ├─ pixelGrid.ts
 │   ├─ tools.ts
 │   ├─ undoStack.ts
 │   ├─ projectCodec.ts
 │   └─ exportPng.ts
 ├─ ui/          # React UI
 │   ├─ EditorPage.tsx
 │   ├─ CanvasView.tsx
 │   ├─ PalettePanel.tsx
 │   ├─ Toolbar.tsx
 │   ├─ StatusBar.tsx
 │   └─ i18n.ts
 └─ main.tsx
