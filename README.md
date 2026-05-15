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

## 터미널에서 바로 실행하기 (오픈소스 사용자용)

> macOS / Linux / WSL 기준. Windows는 PowerShell에서도 같은 명령이 거의 그대로 작동합니다.

### 0. 사전 준비물

- **`git`** — 소스 받기 ([설치 안내](https://git-scm.com/downloads))
- **`python3`** (3.8 이상) — Homer CLI + 로컬 서버용 (`python3 --version`으로 확인)
- 브라우저 (Chrome / Firefox / Safari 아무거나) — 웹 UI용

설치 여부 한 번에 확인:

```bash
git --version && python3 --version
```

---

### 1. 소스코드 받기

```bash
git clone https://github.com/dandanyoou/Homer.git
cd Homer
```

---

### 2. 웹 UI 띄우기 (가장 쉬운 방법)

#### 옵션 A — 파일 더블클릭 (서버 없이)

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows (PowerShell)
start index.html
```

브라우저가 열리면 끝. Caveman 탭과 Homer 탭이 보이면 정상.

> ⚠️ `file://`로 열면 일부 브라우저에서 클립보드 API가 막힐 수 있는데, 그 경우 자동으로 `execCommand` fallback이 동작하도록 되어 있어 복사 버튼은 정상 작동합니다.

#### 옵션 B — 로컬 서버로 띄우기 (추천)

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000` 접속. 종료는 `Ctrl+C`.

---

### 3. Homer CLI 설치 (터미널에서 파이프로 쓰기)

#### 옵션 A — pip로 설치 (가장 빠름)

```bash
pip install homer-cli
```

설치 확인:

```bash
homer --help
```

#### 옵션 B — 소스에서 설치 (clone 한 디렉토리에서)

```bash
# editable install — 코드 수정하면 바로 반영됨
pip install -e .
```

또는 설치 없이 직접 실행:

```bash
python3 homer.py --help
```

---

### 4. Homer CLI 실제 사용 예시

```bash
# git log 압축
git log | homer

# JSON 응답 압축
curl -s https://api.github.com/repos/dandanyoou/Homer | homer --format json

# 테스트 결과에서 실패만 추출
npm test 2>&1 | homer --format test

# 에러 로그에서 ERROR/WARN만
cat app.log | homer --format log

# 압축률 통계 같이 보기
docker ps | homer --stats

# 명령어를 인자로 직접 넘기기
homer git log
```

지원 포맷: `git`, `test`, `json`, `log`, `ls`, `grep`, `csv`, `docker`, `stacktrace`, `generic` (자동 감지)

---

### 5. Chrome 확장 설치 (ChatGPT/Claude/Gemini에서 자동 압축)

```bash
# 1. clone 한 폴더에서 chrome-extension 디렉토리 위치 확인
pwd
ls chrome-extension
```

그 다음 브라우저에서:

1. `chrome://extensions` 접속
2. 우측 상단 **개발자 모드** 토글 ON
3. **압축해제된 확장 프로그램을 로드합니다** 클릭
4. 방금 확인한 `Homer/chrome-extension` 폴더 선택

ChatGPT나 Claude.ai에서 입력창에 텍스트를 넣으면 우측에 🦣 버튼이 나타납니다.

---

### 6. 작동 확인 (1분 컷)

```bash
# CLI 살아있는지
echo "ERROR: db connection failed" | homer --format log
# 기대 출력: === 1 errors === / ❌ ERROR: db connection failed

# 웹 UI 콘솔 에러 없는지 (옵션 B 서버 띄운 상태에서)
curl -sI http://localhost:8000/index.html | head -1
# 기대: HTTP/1.0 200 OK
```

---

### 문제 해결

| 증상 | 해결 |
|---|---|
| `homer: command not found` | `pip install --user homer-cli` 후 `~/.local/bin`을 PATH에 추가 |
| `pip install` 권한 에러 | `pip install --user homer-cli` 또는 `python3 -m venv venv && source venv/bin/activate` 후 재시도 |
| 웹 UI에서 복사 버튼이 "복사 실패" | `https://`나 `localhost`로 접속 (file://에서는 일부 브라우저가 clipboard API를 차단) |
| Chrome 확장이 로드 안 됨 | manifest.json이 있는 `chrome-extension/` 폴더 자체를 선택했는지 확인 (상위 폴더 X) |

---

## 라이선스

MIT
