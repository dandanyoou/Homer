#!/bin/bash
# Homer PyPI 업로드 자동화 스크립트
# 사용법: ./publish.sh
# 사전: pip install build twine

set -e

echo "==================================="
echo "Homer PyPI 업로드 시작"
echo "==================================="

echo "[1/4] 기존 빌드 삭제 중..."
rm -rf dist build *.egg-info

echo "[2/4] 패키지 빌드 중..."
python -m build

echo "[3/4] 패키지 검증 중..."
python -m twine check dist/*

echo "[4/4] PyPI 업로드 중..."
echo ""
echo "*** 사용자명: __token__ ***"
echo "*** 비밀번호: PyPI API 토큰 (pypi-AgEN...) ***"
echo ""
python -m twine upload dist/*

echo "==================================="
echo "완료! https://pypi.org/project/homer-cli/"
echo "==================================="
echo "설치 테스트: pip install homer-cli"
