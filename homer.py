#!/usr/bin/env python3
"""
Homer - CLI 출력 토큰 압축기 v0.2
rtk를 능가하는 지능형 필터. 평균 80%+ 토큰 절감.

지원 필터:
- git (log, diff, status)
- test (Jest, pytest, npm test)
- json (구조 + 샘플)
- log (ERROR/WARN/FATAL만)
- ls (파일 목록)
- grep (검색 결과)
- csv (스키마 + 통계)
- docker (컨테이너 출력)
- stacktrace (에러 스택)
- generic (기본)
"""

import sys
import json
import re
from typing import Optional, List, Tuple
from pathlib import Path


class HomerFilter:
    """기본 필터 클래스"""

    def filter(self, text: str) -> str:
        return text


class GitFilter(HomerFilter):
    """Git 명령어 출력 필터 (개선판)"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')

        if any('commit ' in line for line in lines[:5]):
            return self._filter_git_log(lines)

        if any(line.startswith(('diff --git', '+++', '---', '@@')) for line in lines[:5]):
            return self._filter_git_diff(lines)

        if any('On branch' in line or 'modified:' in line for line in lines[:3]):
            return self._filter_git_status(lines)

        return text

    def _filter_git_log(self, lines: List[str]) -> str:
        """git log: 한 줄 요약 형식으로 더 압축"""
        commits = []
        current = {}

        for line in lines:
            if line.startswith('commit '):
                if current:
                    commits.append(current)
                hash_part = line.split()[1][:7]
                current = {'hash': hash_part, 'msg': '', 'author': ''}
            elif line.startswith('Author:') and current:
                # 이름만 추출 (이메일 제거)
                author = line.replace('Author:', '').strip().split('<')[0].strip()
                current['author'] = author[:20]
            elif line.startswith('Date:') and current:
                # 날짜 단순화 (월/일만)
                date_str = line.replace('Date:', '').strip()
                try:
                    parts = date_str.split()
                    current['date'] = f"{parts[1]} {parts[2]}"  # "Apr 15"
                except:
                    current['date'] = date_str[:10]
            elif line.strip() and current and line.startswith('    ') and not current.get('msg'):
                current['msg'] = line.strip()[:60]

        if current:
            commits.append(current)

        # 한 줄 요약 형식
        result = []
        for c in commits[:30]:  # 30개로 제한
            line = f"{c.get('hash', '')} {c.get('date', '')} {c.get('author', ''):<15} {c.get('msg', '')}"
            result.append(line)

        return '\n'.join(result)

    def _filter_git_diff(self, lines: List[str]) -> str:
        """git diff: 변경 통계만"""
        added, removed, changed_files = 0, 0, []

        for line in lines:
            if line.startswith('diff --git'):
                # 파일 경로 추출
                match = re.search(r'b/(\S+)', line)
                if match:
                    changed_files.append(match.group(1))
            elif line.startswith('+') and not line.startswith('+++'):
                added += 1
            elif line.startswith('-') and not line.startswith('---'):
                removed += 1

        result = [f"Diff Summary: {len(changed_files)} files, +{added}/-{removed}"]
        result.extend([f"  {f}" for f in changed_files[:15]])
        return '\n'.join(result)

    def _filter_git_status(self, lines: List[str]) -> str:
        """git status: 변경 파일만"""
        result = []
        for line in lines:
            if 'modified:' in line or 'new file:' in line or 'deleted:' in line:
                result.append(line.strip()[:70])
        return '\n'.join(result) if result else "Clean (no changes)"


class TestFilter(HomerFilter):
    """테스트 결과 필터 (개선판: FAIL 위주)"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')

        # 통과한 파일 카운트, 실패한 테스트만 추출
        passing_files = 0
        failing_files = []
        fail_details = []
        summary = []

        i = 0
        while i < len(lines):
            line = lines[i]

            # PASS 파일은 카운트만
            if re.match(r'^\s*PASS\s+', line):
                passing_files += 1

            # FAIL 파일은 상세 추출
            elif re.match(r'^\s*FAIL\s+', line):
                failing_files.append(line.strip()[:80])

            # 실패한 테스트 (✗ 또는 ✕)
            elif '✗' in line or '✕' in line:
                fail_details.append(line.strip()[:80])
                # 다음 몇 줄 (에러 메시지)
                for j in range(i+1, min(i+5, len(lines))):
                    if lines[j].strip() and ('Expected' in lines[j] or 'Error' in lines[j] or 'at ' in lines[j]):
                        fail_details.append(f"    {lines[j].strip()[:100]}")

            # Summary 라인
            elif 'Tests:' in line or 'Test Suites:' in line:
                summary.append(line.strip()[:80])

            i += 1

        result = []
        if passing_files:
            result.append(f"✓ {passing_files} test files passed")
        if failing_files:
            result.append(f"\n✗ Failures:")
            result.extend(failing_files)
        if fail_details:
            result.extend(fail_details)
        if summary:
            result.append(f"\n--- Summary ---")
            result.extend(summary)

        return '\n'.join(result)


class JSONFilter(HomerFilter):
    """JSON 필터 (개선됨)"""

    def filter(self, text: str) -> str:
        try:
            data = json.loads(text)
            return self._summarize_json(data)
        except json.JSONDecodeError:
            return text

    def _summarize_json(self, obj, depth=0, max_depth=2) -> str:
        if depth > max_depth:
            return "..."

        indent = "  " * depth

        if isinstance(obj, dict):
            if not obj:
                return "{}"
            result = ["{"]
            keys = list(obj.keys())[:5]
            for key in keys:
                val = obj[key]
                if isinstance(val, dict):
                    result.append(f"{indent}  {key}: <dict>")
                elif isinstance(val, list):
                    item_type = type(val[0]).__name__ if val else "any"
                    result.append(f"{indent}  {key}: <list[{item_type}] x{len(val)}>")
                else:
                    val_str = str(val)[:30]
                    result.append(f"{indent}  {key}: {val_str}")
            if len(obj) > 5:
                result.append(f"{indent}  ... +{len(obj)-5}")
            result.append(f"{indent}}}")
            return "\n".join(result)

        elif isinstance(obj, list):
            if not obj:
                return "[]"
            return f"<list[{type(obj[0]).__name__}] x{len(obj)}>\nfirst: {str(obj[0])[:80]}"

        return str(obj)[:50]


class LogFilter(HomerFilter):
    """로그 필터 (개선판: 더 공격적)"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')

        errors = []
        warnings = []
        last_info = []  # INFO 라인은 마지막 5개만

        for line in lines:
            line_upper = line.upper()
            if any(level in line_upper for level in ['ERROR', 'FATAL', 'EXCEPTION', 'CRITICAL']):
                # 짧게 자르기
                errors.append(self._compact_log(line, '❌'))
            elif 'WARN' in line_upper:
                warnings.append(self._compact_log(line, '⚠️'))
            elif 'INFO' in line_upper or 'DEBUG' in line_upper:
                last_info.append(line.strip())

        # 중복 에러 제거 (메시지 부분만 비교)
        errors = self._dedup(errors)
        warnings = self._dedup(warnings)

        result = []
        if errors:
            result.append(f"=== {len(errors)} errors ===")
            result.extend(errors[:15])
        if warnings:
            result.append(f"\n=== {len(warnings)} warnings ===")
            result.extend(warnings[:10])
        if not errors and not warnings:
            result.append(f"✓ No errors/warnings ({len(last_info)} info lines)")
            result.extend(last_info[-3:])

        return '\n'.join(result)

    def _compact_log(self, line: str, prefix: str) -> str:
        """타임스탬프 단순화 + 메시지 압축"""
        # 타임스탬프 제거 (시간만 남기기)
        line = re.sub(r'\d{4}-\d{2}-\d{2}\s+', '', line)
        # 너무 길면 자르기
        return f"{prefix} {line.strip()[:90]}"

    def _dedup(self, items: List[str]) -> List[str]:
        """비슷한 메시지 중복 제거"""
        seen = set()
        result = []
        for item in items:
            # 숫자/시간 제거 후 비교
            key = re.sub(r'\d+', 'N', item)[:50]
            if key not in seen:
                seen.add(key)
                result.append(item)
        return result


class LSFilter(HomerFilter):
    """ls 명령어 필터 (파일 목록 압축)"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')

        # ls -la 형식 감지
        if any(re.match(r'^[d-][rwx-]{9}', line) for line in lines[:5]):
            return self._filter_ls_la(lines)

        # 단순 ls
        files = [l.strip() for l in lines if l.strip()]
        if len(files) > 30:
            return f"{len(files)} files:\n" + '\n'.join(files[:20]) + f"\n... +{len(files)-20}"
        return '\n'.join(files)

    def _filter_ls_la(self, lines: List[str]) -> str:
        """ls -la: 권한+크기+이름만"""
        result = []
        for line in lines:
            # 권한, 크기, 이름만 추출
            match = re.match(r'^([d-][rwx-]{9})\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\S+\s+\S+\s+(.+)$', line)
            if match:
                perm, size, name = match.groups()
                # 크기 단위 변환
                size_int = int(size)
                if size_int > 1024*1024:
                    size_str = f"{size_int//(1024*1024)}M"
                elif size_int > 1024:
                    size_str = f"{size_int//1024}K"
                else:
                    size_str = f"{size_int}B"
                result.append(f"{perm} {size_str:>6} {name}")
            elif line.strip() and not line.startswith('total'):
                result.append(line.strip()[:80])

        if len(result) > 30:
            return '\n'.join(result[:25]) + f"\n... +{len(result)-25} files"
        return '\n'.join(result)


class GrepFilter(HomerFilter):
    """grep 결과 필터 (파일별 그룹핑)"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')
        groups = {}

        for line in lines:
            # grep -n 형식: file:line:content
            match = re.match(r'^([^:]+):(\d+):(.*)$', line)
            if match:
                file, line_num, content = match.groups()
                if file not in groups:
                    groups[file] = []
                groups[file].append(f"  L{line_num}: {content.strip()[:80]}")
            else:
                if 'OTHER' not in groups:
                    groups['OTHER'] = []
                groups['OTHER'].append(line.strip()[:80])

        # 그룹별 출력
        result = [f"📁 {len(groups)} files, {sum(len(v) for v in groups.values())} matches"]
        for file, matches in list(groups.items())[:10]:
            result.append(f"\n{file}: ({len(matches)} matches)")
            result.extend(matches[:5])
            if len(matches) > 5:
                result.append(f"  ... +{len(matches)-5}")

        return '\n'.join(result)


class CSVFilter(HomerFilter):
    """CSV 필터 (스키마 + 통계)"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')
        if not lines:
            return text

        header = lines[0].split(',')
        rows = [l.split(',') for l in lines[1:] if l.strip()]

        result = [f"CSV: {len(header)} cols, {len(rows)} rows"]
        result.append(f"Headers: {', '.join(h.strip()[:20] for h in header[:8])}")
        if len(header) > 8:
            result.append(f"  ... +{len(header)-8} cols")

        if rows:
            result.append(f"\nFirst row: {','.join(c.strip()[:15] for c in rows[0][:5])}")
            result.append(f"Last row:  {','.join(c.strip()[:15] for c in rows[-1][:5])}")

        return '\n'.join(result)


class DockerFilter(HomerFilter):
    """Docker 명령 출력 필터"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')

        # docker ps 감지
        if any('CONTAINER' in line and 'IMAGE' in line for line in lines[:3]):
            return self._filter_docker_ps(lines)

        # docker logs 감지 - LogFilter 사용
        return LogFilter().filter(text)

    def _filter_docker_ps(self, lines: List[str]) -> str:
        """docker ps: ID + 상태 + 이름만"""
        result = []
        for line in lines[1:]:  # 헤더 제외
            parts = re.split(r'\s{2,}', line.strip())
            if len(parts) >= 4:
                container_id = parts[0][:8]
                image = parts[1][:25]
                status = parts[3] if len(parts) > 3 else ''
                name = parts[-1] if parts else ''
                result.append(f"{container_id} {name:<20} {status[:30]}")
        return f"{len(result)} containers\n" + '\n'.join(result)


class StackTraceFilter(HomerFilter):
    """에러 스택 트레이스 필터"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')

        # 에러 메시지 추출
        error_msg = ""
        traceback = []
        in_traceback = False

        for line in lines:
            if 'Traceback' in line or 'Error:' in line or 'Exception:' in line:
                in_traceback = True
                error_msg = line.strip()[:100]
            elif in_traceback and line.startswith('  File '):
                # 파일 라인만 추출
                match = re.search(r'File "([^"]+)", line (\d+), in (\w+)', line)
                if match:
                    file, line_num, func = match.groups()
                    # 짧은 경로
                    short_file = file.split('/')[-1]
                    traceback.append(f"  {short_file}:{line_num} ({func})")
            elif in_traceback and line.strip() and not line.startswith(' '):
                # 마지막 에러 라인
                error_msg = line.strip()[:100]

        result = [f"❌ {error_msg}"]
        if traceback:
            result.append(f"\nStack ({len(traceback)} frames):")
            # 처음 3개와 마지막 3개만
            if len(traceback) > 6:
                result.extend(traceback[:3])
                result.append(f"  ... +{len(traceback)-6}")
                result.extend(traceback[-3:])
            else:
                result.extend(traceback)

        return '\n'.join(result)


class GenericFilter(HomerFilter):
    """일반 텍스트 필터"""

    def filter(self, text: str) -> str:
        lines = text.strip().split('\n')
        if len(lines) > 80:
            return '\n'.join(lines[:50]) + f"\n... +{len(lines)-50} lines\n" + '\n'.join(lines[-10:])
        result = [line[:120] for line in lines if line.strip()]
        return '\n'.join(result)


def detect_format(text: str) -> str:
    """텍스트 포맷 자동 감지 (개선판)"""
    sample = text[:2000]
    lines = sample.split('\n')[:10]
    first_lines = '\n'.join(lines)

    # Stack trace 우선 감지 (에러)
    if 'Traceback' in first_lines and 'File "' in sample:
        return 'stacktrace'

    # Docker
    if 'CONTAINER ID' in first_lines and 'IMAGE' in first_lines:
        return 'docker'

    # Git
    if any(p in first_lines for p in ['commit ', 'Author:', 'diff --git']):
        return 'git'

    # 테스트
    if any(p in first_lines for p in ['PASS ', 'FAIL ', '✓', '✗', 'Test Suites:']):
        return 'test'

    # JSON
    stripped = text.strip()
    if stripped.startswith(('{', '[')):
        return 'json'

    # CSV (헤더 행에 쉼표가 있고 행이 일정한 컬럼 수)
    if ',' in lines[0] if lines else False:
        if len(lines) >= 2:
            cols1 = lines[0].count(',')
            cols2 = lines[1].count(',') if len(lines) > 1 else 0
            if cols1 > 1 and cols1 == cols2:
                return 'csv'

    # ls 출력
    if any(re.match(r'^[d-][rwx-]{9}', line) for line in lines[:3]):
        return 'ls'

    # grep 출력 (file:line:content)
    if any(re.match(r'^[^:]+:\d+:', line) for line in lines[:3]):
        return 'grep'

    # 로그
    if any(level in first_lines.upper() for level in ['ERROR', 'WARN', 'INFO', 'DEBUG']):
        return 'log'

    return 'generic'


def compress(text: str, format_hint: Optional[str] = None) -> Tuple[str, dict]:
    """메인 압축 함수"""
    if not text.strip():
        return "", {"original": 0, "compressed": 0, "ratio": "0%"}

    detected_format = format_hint or detect_format(text)

    filters = {
        'git': GitFilter(),
        'test': TestFilter(),
        'json': JSONFilter(),
        'log': LogFilter(),
        'ls': LSFilter(),
        'grep': GrepFilter(),
        'csv': CSVFilter(),
        'docker': DockerFilter(),
        'stacktrace': StackTraceFilter(),
        'generic': GenericFilter(),
    }

    filter_obj = filters.get(detected_format, GenericFilter())
    compressed = filter_obj.filter(text)

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
        description='🍩 Homer - CLI 출력 토큰 압축기 v0.2 (rtk 능가)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  git log | homer
  homer git log
  cat test-output.txt | homer --format test
  curl -s api.json | homer --format json
  cat error.log | homer --format stacktrace
  docker ps | homer

Supported formats:
  git, test, json, log, ls, grep, csv, docker, stacktrace, generic
        '''
    )

    parser.add_argument('command', nargs='*', help='실행할 CLI 명령어')
    parser.add_argument(
        '--format',
        choices=['git', 'test', 'json', 'log', 'ls', 'grep', 'csv', 'docker', 'stacktrace', 'generic'],
        help='포맷 명시 (auto-detect 비활성)'
    )
    parser.add_argument('--stats', action='store_true', help='압축 통계 표시')

    args = parser.parse_args()

    # 입력 읽기
    if args.command:
        import subprocess
        try:
            result = subprocess.run(args.command, capture_output=True, text=True)
            text = result.stdout + result.stderr
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        text = sys.stdin.read()

    if not text.strip():
        print("(empty)", file=sys.stderr)
        return

    compressed, stats = compress(text, format_hint=args.format)
    print(compressed)

    if args.stats:
        print("\n--- Homer Stats ---", file=sys.stderr)
        print(f"Format: {stats['format']}", file=sys.stderr)
        print(f"Original: {stats['original_chars']:,} chars / {stats['original_tokens']} tokens", file=sys.stderr)
        print(f"Compressed: {stats['compressed_chars']:,} chars / {stats['compressed_tokens']} tokens", file=sys.stderr)
        print(f"Saved: {stats['ratio']}", file=sys.stderr)


if __name__ == '__main__':
    main()
