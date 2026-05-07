# 📦 PyPI 배포 가이드

## 사전 준비

### 1. PyPI 계정 만들기
1. https://pypi.org/account/register/ 가입
2. 이메일 인증
3. 2FA 활성화 (필수)

### 2. API 토큰 발급
1. https://pypi.org/manage/account/token/ 이동
2. "Add API token" 클릭
3. Token name: "homer-cli"
4. Scope: "Entire account" (첫 배포는 전체 권한 필요)
5. **토큰 복사하여 저장** (다시 볼 수 없음)

## 배포 절차

### 첫 배포 (TestPyPI 권장)

```bash
# 1. 패키지 빌드
python -m build

# 2. TestPyPI에 먼저 업로드 (테스트용)
python -m twine upload --repository testpypi dist/*
# 사용자명: __token__
# 비밀번호: pypi-AgEN...토큰 전체 붙여넣기

# 3. TestPyPI에서 설치 테스트
pip install --index-url https://test.pypi.org/simple/ homer-cli

# 4. 정상 동작 확인 후 진짜 PyPI에 업로드
python -m twine upload dist/*
```

### 이후 업데이트

```bash
# 1. pyproject.toml에서 version 수정 (예: 0.2.0 → 0.2.1)

# 2. 기존 dist 삭제
rm -rf dist/

# 3. 다시 빌드 + 업로드
python -m build
python -m twine upload dist/*
```

## 자격 증명 저장 (한 번 설정하면 다시 입력 불필요)

`~/.pypirc` 파일 생성:

```ini
[distutils]
index-servers =
    pypi
    testpypi

[pypi]
username = __token__
password = pypi-AgEN...실제토큰...

[testpypi]
repository = https://test.pypi.org/legacy/
username = __token__
password = pypi-AgEN...실제토큰...
```

## 배포 후 확인

```bash
# 어디서든 설치 가능
pip install homer-cli

# 사용 테스트
git log | homer --stats
```

## 패키지 페이지

배포 성공 시:
- **PyPI 페이지**: https://pypi.org/project/homer-cli/
- **검색 가능**: `pip search homer` (또는 PyPI 웹사이트 검색)
- **글로벌 다운로드 가능**

## 트러블슈팅

### "File already exists" 에러
- 같은 버전을 두 번 업로드할 수 없음
- pyproject.toml에서 version 올린 후 재빌드

### "Invalid distribution" 에러
- README의 마크다운 형식 검증: `python -m readme_renderer README.md`

### 토큰 인증 실패
- 토큰 앞에 `pypi-` 포함 확인
- username은 `__token__` (밑줄 2개씩)
