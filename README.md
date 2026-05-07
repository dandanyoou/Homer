# 🦣🍩 Token Optimizer

AI 토큰 낭비 종결자. **프롬프트 + CLI 출력**을 한 번에 압축합니다.

🌐 **Live**: https://dandanyoou.github.io/dancaveman/

---

## 두 가지 도구를 한 사이트에서

### 🦣 Caveman — 프롬프트 압축기
긴 프롬프트를 "원시인 말투"로 압축. **70%+ 절감**

```
원본: "안녕하세요. 저는 지금 여러분의 도움이 필요한데요, 
      특히 사용자 인터페이스를 개선하고 싶습니다."
                ↓ 🦣 Caveman
압축: "UI 개선 도움 필요"
```

### 🍩 Homer — CLI 출력 압축기
git log, npm test, JSON, 로그 등을 압축. **80%+ 절감** (rtk 능가)

```
원본: 5KB 짜리 git log
                ↓ 🍩 Homer
압축: 한 줄 요약 형식 (74% 절감)
```

---

## 실측 성능

### Caveman (프롬프트)
- 한국어 존댓말, 군더더기 서두, 약한 표현 제거
- 13단계 압축 알고리즘
- **평균 70%+ 절감**

### Homer (CLI 출력)
| 시나리오 | 압축률 |
|---------|--------|
| Git Log | 70.3% |
| NPM Test | 71.7% |
| JSON | **93.9%** |
| Logs | **90.4%** |
| CSV | 77.6% |
| Stack Trace | 77.6% |
| **평균** | **81.6%** |

vs rtk 평균 75% → **6.6%p 우세**

---

## 사용법

### 웹에서 (둘 다)
1. https://dandanyoou.github.io/dancaveman/ 접속
2. 탭 선택 (Caveman / Homer)
3. 텍스트 붙여넣기
4. 압축 버튼 클릭

### CLI에서 (Homer만)
```bash
pip install homer-cli
git log | homer
homer --format json < data.json
```

GitHub: https://github.com/dandanyoou/Homer

---

## 기술 스택

- **Frontend**: HTML + Vanilla JS (브라우저에서 직접 실행)
- **Backend**: 없음 (서버 비용 0원)
- **배포**: GitHub Pages (무료)
- **Caveman**: JavaScript (compress.js)
- **Homer**: Python (homer.py) + JavaScript 포팅 (homer.js)

---

## 라이선스

MIT
