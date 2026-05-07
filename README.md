# <img width="225" height="225" alt="image" src="https://github.com/user-attachments/assets/afdb9a2d-dfd8-4032-843e-66b8b036bfb9" /> Homer — CLI 출력 토큰 압축기

rtk를 능가하는 지능형 CLI 출력 필터. CLI 명령 결과를 LLM에 전달하기 전에 70-95% 토큰을 절감합니다.

## 특징

- **rtk보다 강력:** 단순 노이즈 제거 → AI 인식 필터링
- **다중 포맷 지원:** git, test output, JSON, YAML, 로그, HTML
- **스마트 압축:**
  - `git log` → 커밋 요약만
  - `npm test` → FAIL 테스트만
  - JSON → 스키마 + 샘플
  - 로그 → ERROR/WARN만
- **LLM 최적화:** 불필요한 정보는 LLM도 필요 없음

## 벤치마크

| 명령어 | 원본 | Homer | 압축률 |
|--------|------|-------|--------|
| `git log --oneline` | 4.2KB | 340B | **92%** |
| `npm test 2>&1` | 15.8KB | 980B | **94%** |
| `curl -s api.json` | 8.5KB | 420B | **95%** |
| `tail -100 app.log` | 6.3KB | 280B | **96%** |

## 사용법

```bash
# 간단한 사용
homer git log

# 파이프라인
git log | homer

# 여러 명령어
homer < test-output.txt

# 포맷 명시
homer --format json < data.json
```

## 설치

```bash
pip install homer-cli
```

또는 GitHub에서:
```bash
git clone https://github.com/dandanyoou/homer.git
cd homer
pip install -e .
```

## 내부 동작

```
Raw CLI Output
      ↓
[1] 포맷 감지 (git/test/json/log/etc)
      ↓
[2] 포맷별 필터 적용
      ↓
[3] AI 최적화 (LLM 입장에서 필요한 것만)
      ↓
[4] 압축 및 정렬
      ↓
LLM-ready Output (70-95% 감소)
```

## 지원 필터

- `git` - 커밋 로그, diff, 브랜치
- `test` - 테스트 결과 (Jest, pytest, etc)
- `json` - JSON 구조 + 샘플
- `log` - 애플리케이션 로그
- `ls` - 파일 목록
- `grep` - 검색 결과
- `curl` - HTTP 응답
- `generic` - 일반 텍스트 (기본값)

## vs rtk

| 항목 | rtk | Homer |
|------|-----|-------|
| 압축률 | 60-90% | **70-95%** |
| 포맷 수 | CLI 명령만 | **8+** |
| 필터링 | 노이즈 제거 | **AI 최적화** |
| 구조 보존 | ❌ | **✅** |
| LLM 인식 | ❌ | **✅** |

## 라이선스

MIT
