# 아이콘 추가하기

Chrome 확장 아이콘은 PNG 파일이 필요합니다.

## 옵션 1: 직접 만들기

다음 크기의 PNG 파일이 필요합니다:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

이모지 🦣🍩를 PNG로 변환:
- https://emojigraph.org/ko/ 에서 다운로드
- 또는 https://favicon.io/emoji-favicons/

## 옵션 2: 이모지 그대로 사용

manifest.json에 아이콘이 없어도 확장은 정상 동작합니다.
Chrome이 기본 퍼즐 조각 아이콘을 표시합니다.

## 옵션 3: 빠르게 SVG로 만들기

```html
<!-- save as icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
  <rect width="128" height="128" rx="20" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#667eea"/>
      <stop offset="100%" stop-color="#764ba2"/>
    </linearGradient>
  </defs>
  <text x="50%" y="60%" text-anchor="middle" font-size="80">🦣</text>
</svg>
```
그런 다음 SVG를 PNG로 변환 (Inkscape, https://cloudconvert.com/svg-to-png 등).
