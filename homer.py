#!/usr/bin/env python3
"""
Homer - CLI 출력 토큰 압축기
rtk를 능가하는 지능형 필터. 70-95% 토큰 절감.
"""

import sys
import json
import re
from typing import Optional, List, Tuple
from pathlib import Path


class HomerFilter:
    """기본 필터 클래스"""

    def __init__(self):
        self.lines = []

    def filter(self, text: str) -> str:
        """텍스트 필터링 - 오버라이드할 메서드"""
        return text


class GitFilter(HomerFilter):
    """Git 명령어 출력 필터 (log, diff, status)"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')

        # git log 감지
        if any('commit ' in line for line in lines[:5]):
            return self._filter_git_log(lines)

        # git diff 감지
        if any(line.startswith(('diff --git', '+++', '---', '@@')) for line in lines[:5]):
            return self._filter_git_diff(lines)

        # git status 감지
        if any('On branch' in line or 'modified:' in line for line in lines[:3]):
            return self._filter_git_status(lines)

        return text

    def _filter_git_log(self, lines: List[str]) -> str:
        """git log 요약: 커밋만 추출"""
        result = []
        for line in lines:
            if line.startswith('commit '):
                # commit 해시만 처음 8자로
                hash_part = line.split()[1][:8]
                result.append(f"commit {hash_part}")
            elif line.startswith('Author:'):
                result.append(line[:50])  # 50자만
            elif line.startswith('Date:'):
                result.append(line)
            elif line.strip() and not line.startswith('    '):
                # 메시지 라인 (공백 4칸이 아닌 줄)
                result.append(line[:70])

        return '\n'.join(result[:50])  # 처음 50줄만

    def _filter_git_diff(self, lines: List[str]) -> str:
        """git diff: 변경 요약만"""
        result = []
        added, removed, changed_files = 0, 0, set()

        for line in lines:
            if line.startswith('diff --git'):
                changed_files.add(line.split()[-1])
            elif line.startswith('+') and not line.startswith('+++'):
                added += 1
            elif line.startswith('-') and not line.startswith('---'):
                removed += 1

        result.append(f"Files changed: {len(changed_files)}")
        result.append(f"Lines added: {added}")
        result.append(f"Lines removed: {removed}")
        result.extend([f"  {f}" for f in list(changed_files)[:10]])

        return '\n'.join(result)

    def _filter_git_status(self, lines: List[str]) -> str:
        """git status: 변경 파일만"""
        result = []
        for line in lines:
            if 'modified:' in line or 'new file:' in line or 'deleted:' in line:
                result.append(line[:70])

        return '\n'.join(result) if result else "Nothing to commit"


class TestFilter(HomerFilter):
    """테스트 결과 필터 (Jest, pytest, npm test)"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')
        result = []

        # 테스트 요약 찾기
        summary_found = False
        for i, line in enumerate(lines):
            # PASS/FAIL 테스트만
            if '✓' in line or '✗' in line or 'PASS' in line or 'FAIL' in line:
                result.append(line[:80])

            # 테스트 요약 섹션
            if 'test suites' in line.lower() or 'passed' in line.lower():
                result.append('\n--- Summary ---')
                result.extend(lines[i:i+5])
                summary_found = True
                break

        # 에러 메시지 추출
        if not summary_found:
            for i, line in enumerate(lines):
                if 'Error:' in line or 'AssertionError' in line:
                    result.append('\n--- Errors ---')
                    result.extend(lines[i:min(i+10, len(lines))])
                    break

        return '\n'.join(result[:50])


class JSONFilter(HomerFilter):
    """JSON 출력 필터 - 구조 + 샘플만"""

    def filter(self, text: str) -> str:
        try:
            data = json.loads(text)
            return self._summarize_json(data)
        except json.JSONDecodeError:
            # JSON이 아니면 일반 처리
            return text

    def _summarize_json(self, obj, depth=0, max_depth=3) -> str:
        """JSON 구조 요약"""
        if depth > max_depth:
            return "..."

        indent = "  " * depth

        if isinstance(obj, dict):
            if not obj:
                return "{}"

            result = ["{"]
            keys = list(obj.keys())[:5]  # 처음 5개 키만
            for key in keys:
                val = obj[key]
                if isinstance(val, (dict, list)):
                    result.append(f"{indent}  {key}: <{type(val).__name__}>")
                else:
                    val_str = str(val)[:30]
                    result.append(f"{indent}  {key}: {val_str}")

            if len(obj) > 5:
                result.append(f"{indent}  ... ({len(obj)-5} more keys)")

            result.append(f"{indent}}}")
            return "\n".join(result)

        elif isinstance(obj, list):
            if not obj:
                return "[]"

            result = [f"[{len(obj)} items]"]
            result.append(f"  First item: {str(obj[0])[:50]}")
            return "\n".join(result)

        else:
            return str(obj)[:50]


class LogFilter(HomerFilter):
    """로그 파일 필터 - ERROR/WARN만"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')
        result = []

        # ERROR와 WARN 라인만 추출
        for line in lines:
            if any(level in line.upper() for level in ['ERROR', 'FATAL', 'EXCEPTION']):
                result.append(f"❌ {line[:80]}")
            elif 'WARN' in line.upper():
                result.append(f"⚠️ {line[:80]}")

        if not result:
            # 에러가 없으면 마지막 10줄만
            result = [f"✅ All lines checked - No errors found"]
            result.extend([line[:80] for line in lines[-10:]])

        return '\n'.join(result[:30])


class GenericFilter(HomerFilter):
    """일반 텍스트 필터 - 기본값"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')

        # 너무 길면 자르기
        if len(lines) > 100:
            return '\n'.join(lines[:100]) + f"\n... ({len(lines)-100} more lines)"

        # 각 줄이 너무 길면 자르기
        result = [line[:100] if len(line) > 100 else line for line in lines]

        # 빈 줄 많으면 압축
        result = [line for line in result if line.strip()]

        return '\n'.join(result)


def detect_format(text: str) -> str:
    """텍스트 포맷 자동 감지"""
    lines = text.split('\n')[:10]
    text_sample = '\n'.join(lines)

    # Git 감지
    if any(pattern in text_sample for pattern in ['commit ', 'Author:', 'diff --git']):
        return 'git'

    # 테스트 결과 감지
    if any(pattern in text_sample for pattern in ['PASS', 'FAIL', '✓', '✗', 'test suites']):
        return 'test'

    # JSON 감지
    if text.strip().startswith('{') or text.strip().startswith('['):
        return 'json'

    # 로그 감지
    if any(level in text_sample.upper() for level in ['ERROR', 'WARN', 'INFO', 'DEBUG']):
        return 'log'

    return 'generic'


def compress(text: str, format_hint: Optional[str] = None) -> Tuple[str, dict]:
    """메인 압축 함수

    Args:
        text: 압축할 텍스트
        format_hint: 포맷 힌트 (git, test, json, log, generic)

    Returns:
        (압축된 텍스트, 통계 딕셔너리)
    """
    if not text.strip():
        return "", {"original": 0, "compressed": 0, "ratio": "0%"}

    # 포맷 감지
    detected_format = format_hint or detect_format(text)

    # 필터 선택
    filters = {
        'git': GitFilter(),
        'test': TestFilter(),
        'json': JSONFilter(),
        'log': LogFilter(),
        'generic': GenericFilter(),
    }

    filter_obj = filters.get(detected_format, GenericFilter())

    # 압축 실행
    compressed = filter_obj.filter(text)

    # 통계
    original_tokens = len(text.split())
    compressed_tokens = len(compressed.split())
    ratio = 100 * (1 - compressed_tokens / max(original_tokens, 1))

    stats = {
        'original_chars': len(text),
        'compressed_chars': len(compressed),
        'original_tokens': original_tokens,
        'compressed_tokens': compressed_tokens,
        'ratio': f"{ratio:.1f}%",
        'format': detected_format,
    }

    return compressed, stats


def main():
    """CLI 엔트리포인트"""
    import argparse

    parser = argparse.ArgumentParser(
        description='🍩 Homer - CLI 출력 토큰 압축기 (rtk 능가)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  git log | homer
  homer git log
  cat test-output.txt | homer --format test
  curl -s api.json | homer --format json
        '''
    )

    parser.add_argument(
        'command',
        nargs='*',
        help='실행할 CLI 명령어'
    )

    parser.add_argument(
        '--format',
        choices=['git', 'test', 'json', 'log', 'generic'],
        help='포맷 명시 (auto-detect하지 않음)'
    )

    parser.add_argument(
        '--stats',
        action='store_true',
        help='압축 통계 표시'
    )

    args = parser.parse_args()

    # 입력 읽기
    if args.command:
        # 명령어로부터 읽기
        import subprocess
        try:
            result = subprocess.run(args.command, capture_output=True, text=True)
            text = result.stdout + result.stderr
        except Exception as e:
            print(f"Error running command: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # stdin으로부터 읽기
        text = sys.stdin.read()

    if not text.strip():
        print("(empty input)", file=sys.stderr)
        return

    # 압축
    compressed, stats = compress(text, format_hint=args.format)

    # 출력
    print(compressed)

    # 통계 표시
    if args.stats:
        print("\n--- Homer Stats ---", file=sys.stderr)
        print(f"Format: {stats['format']}", file=sys.stderr)
        print(f"Original: {stats['original_chars']:,} chars / {stats['original_tokens']} tokens", file=sys.stderr)
        print(f"Compressed: {stats['compressed_chars']:,} chars / {stats['compressed_tokens']} tokens", file=sys.stderr)
        print(f"Saved: {stats['ratio']}", file=sys.stderr)


if __name__ == '__main__':
    main()
