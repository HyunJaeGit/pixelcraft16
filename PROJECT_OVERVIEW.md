# PixelCraft 16 프로젝트 개요

> 이 문서는 저장소의 현재 코드와 설정을 바탕으로 정리한 개발 참고 문서입니다. 기능 설명은 코드에서 확인한 범위이며, 배포 버전과 동작이 다를 수 있습니다.

## 1. 프로젝트 요약

PixelCraft 16은 브라우저에서 동작하는 픽셀 아트 편집기입니다. React와 TypeScript로 UI를 만들고, 픽셀 데이터 조작·프로젝트 직렬화·PNG 인코딩은 순수 TypeScript 코어 모듈로 분리했습니다. 서버나 계정 없이 작업하며 브라우저 LocalStorage에 현재 그림을 자동 저장합니다.

- 기술 구성: React 19, TypeScript 5.9, Vite 7
- 렌더링: HTML Canvas 2D API
- 배포 설정: GitHub Pages (`vite.config.ts`의 base 경로 `/pixelcraft16/`, `.github/workflows`의 Pages 배포 작업)
- 현재 앱 진입점: `src/main.tsx` → `src/App.tsx` → `src/ui/EditorPage.tsx`
- 주요 데이터: 캔버스의 각 픽셀을 ARGB `Uint32Array`로 보관

## 2. 현재 구현된 기능

### 캔버스 편집

- 정사각형 캔버스 생성: 16×16, 32×32, 64×64, 128×128
- 연필 도구로 픽셀 그리기
- 채우기 도구로 같은 색의 연결 영역 채우기(상하좌우 4방향)
- 지우기: 우클릭 또는 Shift를 누른 채 그리기
- 스포이트 도구로 캔버스의 불투명 픽셀 색상 선택
- 프로젝트별 가변 팔레트: 기본 16색과 기존 사용자 색 슬롯으로 시작하며 HEX 또는 색상 선택기로 색을 추가·수정·삭제 (최대 256색)
- 확대 배율 8×, 16×, 24×, 32× 선택 및 픽셀 격자 표시 전환
- 포인터 위치와 캔버스 크기·배율·현재 도구를 상태 표시줄에 표시

### 작업 관리와 파일

- Undo/Redo, 최대 20단계
- 단축키: Undo `Ctrl/Cmd+Z`, Redo `Ctrl/Cmd+Y` 또는 `Ctrl/Cmd+Shift+Z`
- PNG 내보내기: 원본 픽셀을 16배 확대해 `<파일명>_<너비>x<높이>@16x.png`로 다운로드
- JSON 프로젝트 내보내기 및 JSON 파일 가져오기
- 프로젝트 데이터는 `version`, `width`, `height`, `palette`, `pixels`를 포함
- 기존 16색/17색 프로젝트를 포함해 1~256색 팔레트를 불러올 수 있으며, HEX 색상 형식을 검증
- LocalStorage 키 `pixelcraft16.project.v2`에 변경 후 약 250ms 디바운스로 자동 저장
- 파일명 입력과 다운로드 이름에 사용되는 파일명 정리
- 새 작업·가져오기 전에 변경 사항이 있다고 판단되면 확인 대화상자 표시

### 참고 이미지와 언어

- 로컬 이미지 파일을 오른쪽 참고 패널에 표시하고 지울 수 있음
- 한국어/영어 전환 UI가 있음
- 참고 이미지는 현재 메모리의 Object URL로만 표시되며 프로젝트 JSON이나 자동 저장 데이터에 포함되지 않음

## 3. 화면 구성 및 주요 모듈

| 경로 | 역할 |
| --- | --- |
| `src/ui/EditorPage.tsx` | 앱 상태와 편집 동작 조정, 자동 저장, Undo/Redo, Import/Export |
| `src/ui/Toolbar.tsx` | 파일명, 도구, 확대, 격자, 새 캔버스, 실행 취소/다시 실행, 파일 메뉴, 언어 선택 |
| `src/ui/CanvasView.tsx` | Canvas 렌더링, 픽셀 좌표 변환, 포인터 입력 처리, 격자 오버레이 |
| `src/ui/PalettePanel.tsx` | 기본/사용자 지정 팔레트와 스포이트 도구 UI |
| `src/ui/ReferencePanel.tsx` | 참고 이미지 불러오기와 표시 |
| `src/ui/StatusBar.tsx` | 크기, 확대, 도구, 좌표, 저작권 정보 표시 |
| `src/ui/i18n.ts` | 한국어/영어 UI 문자열 |
| `src/core/pixelGrid.ts` | 픽셀 격자 생성, 읽기/쓰기, 복제 및 범위 검사 |
| `src/core/tools.ts` | 연필 및 4방향 영역 채우기 로직 |
| `src/core/undoStack.ts` | 제네릭 Undo/Redo 스냅샷 스택 |
| `src/core/projectCodec.ts` | 프로젝트 생성, JSON 직렬화 및 검증/복원 |
| `src/core/storage.ts` | LocalStorage 저장 및 불러오기 |
| `src/core/exportPng.ts` | ARGB 픽셀 데이터를 PNG 바이트로 인코딩 |
| `src/core/coord.ts` | 좌표 범위 및 정수 보조 함수 |
| `src/core/constants.ts` | 팔레트, 캔버스 크기, 버전, Undo 제한 등 상수 |
| `src/core/core.test.ts` | 코어 모듈의 Vitest 단위 테스트 |

코어 모듈은 `src/core/index.ts`에서 모아 내보냅니다. UI는 코어 함수를 호출해 상태를 반영하는 구조입니다.

## 4. 개발 및 실행

Node.js와 npm이 준비된 환경에서 저장소 루트에서 실행합니다.

```bash
npm install
npm run dev
```

주요 명령:

```bash
npm run build       # TypeScript 프로젝트 빌드 검사 후 Vite 프로덕션 빌드
npm run lint        # ESLint
npm run test        # Vitest 대화형 실행
npm run test:run    # Vitest 일회 실행
npm run preview     # 빌드 결과 로컬 미리보기
```

GitHub Actions는 `main` 브랜치 push 시 의존성을 설치하고 `npm run build` 후 GitHub Pages에 배포하도록 설정되어 있습니다.

## 5. 현재 코드에서 확인한 개발 유의점

- **문자 인코딩/UI 문구:** `src/ui/i18n.ts`의 한국어 문자열, 일부 주석, `README.md`에서 한글이 깨진 형태로 저장된 부분이 확인됩니다. 후속 기능 개발 전에 원본 문구를 확인하고 UTF-8로 복구하는 것이 좋습니다. 이 문서의 한국어 문구는 새로 작성했습니다.
- **스타터 템플릿 잔여물:** `src/index.css`, `src/App.css`, `index.html`에 Vite 기본 스타일/파비콘/메타 정보가 남아 있습니다. 편집기 레이아웃은 주로 인라인 스타일로 구성되어 있습니다.
- **불러오기 검증:** `decodeProject`는 팔레트 색상 형식과 개수(1~256), 픽셀 배열 길이를 확인합니다. 캔버스 크기의 허용 범위와 지원 버전은 여전히 충분히 제한하지 않습니다.
- **저장 실패 처리:** LocalStorage 쓰기 실패(용량 초과/브라우저 제한)는 UI에서 처리하지 않습니다. 불러오기 실패는 `null`로 조용히 처리되어 새 프로젝트가 열립니다.
- **작업 변경 감지:** 변경 확인 판단에 Undo 가능 여부가 포함됩니다. 따라서 실제 편집 여부나 저장 완료 여부와 완전히 일치하는 dirty 상태 모델은 아닙니다.
- **PNG 인코딩:** 코어의 PNG 인코더는 순수 TypeScript이며 압축되지 않은 DEFLATE 블록을 사용합니다. 큰 출력에서는 파일이 커질 수 있습니다. UI의 PNG 내보내기 배율은 현재 16배로 고정되어 있습니다.
- **색상 모델:** 저장 데이터는 ARGB 정수입니다. 팔레트는 불투명 HEX 색을 사용하고 투명 픽셀은 값 `0`으로 표현합니다.
- **테스트 범위:** 현재 테스트는 PixelGrid, 연필/채우기, Undo/Redo, JSON 왕복 및 구버전 팔레트 처리, PNG 구조의 기본 검증에 집중합니다. UI 상호작용이나 브라우저 저장 흐름 테스트는 보이지 않습니다.

## 6. 후속 개발 시 출발점

1. 저장·불러오기 실패와 프로젝트 JSON 입력 오류를 사용자에게 명확히 전달
2. 더 풍부한 편집 도구(예: 선/도형, 선택, 캔버스 크기 조절) 중 제품 방향에 맞는 항목을 선정
3. PNG 배율·배경 옵션, 데이터 크기와 압축 개선을 검토
4. 한국어 문자열과 README를 복구하고 앱 언어/메타 정보/파비콘을 제품에 맞게 정리
5. 현재 코어 테스트를 기준으로 새 도구 및 파일 포맷 변경에 회귀 테스트 추가

## 7. 저장소 루트 파일

- `package.json`, `package-lock.json`: 스크립트와 의존성
- `vite.config.ts`: Vite 및 GitHub Pages base 경로
- `tsconfig*.json`: TypeScript 설정
- `eslint.config.js`: ESLint 설정
- `index.html`: 브라우저 문서 진입점
- `README.md`: 기존 소개 문서(현재 일부 문자가 깨져 보임)
- `LICENSE`: 저장소에 포함된 라이선스/사용 조건 문서. 배포 또는 재사용 시 원문을 직접 확인할 것
- `.github/workflows/`: GitHub Pages 배포 자동화
