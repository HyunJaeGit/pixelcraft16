# PixelCraft 16 (Beta)

> ⚠️ **Beta Version**
>
> 이 저장소의 PixelCraft 16은 **베타 버전(Beta)**입니다.  
> 현재 버전은 **정적 웹 기반 픽셀 편집 툴**에 집중하며,
> 서버 API, 계정, 클라우드 저장, 확장 기능 등은  
> **정식 배포(Stable Release) 버전에서 단계적으로 추가될 예정**입니다.

**16색 제한 픽셀 아이콘 메이커 (정적 웹 툴)**  
React + TypeScript + Vite 기반, 서버 없이 GitHub Pages에서 동작합니다.

---

## 🔹 프로젝트 소개

**PixelCraft 16**은  
복잡한 기능을 제거하고, **빠르고 안정적인 픽셀 작업 경험**에 집중한  
**16색 제한 픽셀 아이콘/스프라이트 제작 웹 툴**입니다.

- 서버, 로그인, 계정 ❌ *(베타 버전에서는 미포함)*
- 설치 필요 ❌
- 브라우저만 있으면 즉시 사용 ⭕

> 이 프로젝트는 “기능 많은 에디터”가 아니라  
> **언제나 열 수 있는 작은 픽셀 작업대**를 목표로 합니다.

---

## 🧪 베타 버전 범위 (현재)

### 포함되는 것
- 정적 웹 기반 픽셀 편집 기능
- LocalStorage 기반 자동 저장
- PNG / JSON Export & Import
- Undo / Redo
- 한국어 / 영어 전환

### ❌ 포함되지 않는 것 (정식 버전 예정)
- 서버 API
- 사용자 계정 / 로그인
- 클라우드 저장
- 협업 기능
- AI 기반 기능
- 모바일 앱 / 데스크톱 앱 패키징

> 위 기능들은 **정식 배포 버전(Stable)** 또는  
> 이후 Phase에서 추가될 수 있습니다.

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
- 서버 / API / DB 사용 없음 (Beta 기준)

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
