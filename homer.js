// Homer.js - CLI 출력 압축기 (Python homer.py의 JavaScript 포팅)
// 브라우저에서 직접 실행 가능

function homerCompress(text, formatHint = null) {
    if (!text || !text.trim()) {
        return { compressed: '', stats: { format: 'empty', ratio: '0%' } };
    }

    const detectedFormat = formatHint || detectFormat(text);
    const compressed = applyFilter(text, detectedFormat);

    const originalTokens = text.split(/\s+/).filter(w => w).length;
    const compressedTokens = compressed.split(/\s+/).filter(w => w).length;
    const ratio = (100 * (1 - compressedTokens / Math.max(originalTokens, 1))).toFixed(1);

    return {
        compressed,
        stats: {
            format: detectedFormat,
            originalChars: text.length,
            compressedChars: compressed.length,
            originalTokens,
            compressedTokens,
            ratio: ratio + '%'
        }
    };
}

function detectFormat(text) {
    const sample = text.slice(0, 2000);
    const lines = sample.split('\n').slice(0, 10);
    const firstLines = lines.join('\n');

    if (firstLines.includes('Traceback') && sample.includes('File "')) return 'stacktrace';
    if (firstLines.includes('CONTAINER ID') && firstLines.includes('IMAGE')) return 'docker';
    if (/commit |Author:|diff --git/.test(firstLines)) return 'git';
    if (/PASS |FAIL |✓|✗|Test Suites:/.test(firstLines)) return 'test';

    const stripped = text.trim();
    if (stripped.startsWith('{') || stripped.startsWith('[')) return 'json';

    if (lines[0] && lines[0].includes(',') && lines.length >= 2) {
        const cols1 = (lines[0].match(/,/g) || []).length;
        const cols2 = (lines[1].match(/,/g) || []).length;
        if (cols1 > 1 && cols1 === cols2) return 'csv';
    }

    if (lines.slice(0, 3).some(l => /^[d-][rwx-]{9}/.test(l))) return 'ls';
    if (lines.slice(0, 3).some(l => /^[^:]+:\d+:/.test(l))) return 'grep';

    if (/ERROR|WARN|INFO|DEBUG/i.test(firstLines)) return 'log';

    return 'generic';
}

function applyFilter(text, format) {
    const filters = {
        git: filterGit,
        test: filterTest,
        json: filterJson,
        log: filterLog,
        ls: filterLs,
        grep: filterGrep,
        csv: filterCsv,
        docker: filterDocker,
        stacktrace: filterStackTrace,
        generic: filterGeneric
    };
    return (filters[format] || filterGeneric)(text);
}

function filterGit(text) {
    const lines = text.trim().split('\n');

    if (lines.some(l => l.includes('commit '))) {
        const commits = [];
        let current = {};

        for (const line of lines) {
            if (line.startsWith('commit ')) {
                if (Object.keys(current).length) commits.push(current);
                const hashPart = line.split(/\s+/)[1].slice(0, 7);
                current = { hash: hashPart, msg: '', author: '' };
            } else if (line.startsWith('Author:') && current) {
                const author = line.replace('Author:', '').trim().split('<')[0].trim();
                current.author = author.slice(0, 20);
            } else if (line.startsWith('Date:') && current) {
                const dateStr = line.replace('Date:', '').trim();
                const parts = dateStr.split(/\s+/);
                current.date = parts.length > 2 ? `${parts[1]} ${parts[2]}` : dateStr.slice(0, 10);
            } else if (line.startsWith('    ') && current && !current.msg) {
                current.msg = line.trim().slice(0, 60);
            }
        }
        if (Object.keys(current).length) commits.push(current);

        return commits.slice(0, 30).map(c =>
            `${c.hash || ''} ${c.date || ''} ${(c.author || '').padEnd(15)} ${c.msg || ''}`
        ).join('\n');
    }

    if (lines.some(l => /^diff --git|^---|^\+\+\+|^@@/.test(l))) {
        let added = 0, removed = 0;
        const files = [];
        for (const line of lines) {
            if (line.startsWith('diff --git')) {
                const match = line.match(/b\/(\S+)/);
                if (match) files.push(match[1]);
            } else if (line.startsWith('+') && !line.startsWith('+++')) added++;
            else if (line.startsWith('-') && !line.startsWith('---')) removed++;
        }
        return `Diff Summary: ${files.length} files, +${added}/-${removed}\n${files.slice(0, 15).map(f => '  ' + f).join('\n')}`;
    }

    return text;
}

function filterTest(text) {
    const lines = text.trim().split('\n');
    let passingFiles = 0;
    const failingFiles = [];
    const failDetails = [];
    const summary = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^\s*PASS\s+/.test(line)) passingFiles++;
        else if (/^\s*FAIL\s+/.test(line)) failingFiles.push(line.trim().slice(0, 80));
        else if (line.includes('✗') || line.includes('✕')) {
            failDetails.push(line.trim().slice(0, 80));
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                if (lines[j].trim() && /Expected|Error|at /.test(lines[j])) {
                    failDetails.push('    ' + lines[j].trim().slice(0, 100));
                }
            }
        } else if (line.includes('Tests:') || line.includes('Test Suites:')) {
            summary.push(line.trim().slice(0, 80));
        }
    }

    const result = [];
    if (passingFiles) result.push(`✓ ${passingFiles} test files passed`);
    if (failingFiles.length) {
        result.push('\n✗ Failures:');
        result.push(...failingFiles);
    }
    if (failDetails.length) result.push(...failDetails);
    if (summary.length) {
        result.push('\n--- Summary ---');
        result.push(...summary);
    }
    return result.join('\n');
}

function filterJson(text) {
    try {
        const data = JSON.parse(text);
        return summarizeJson(data, 0, 2);
    } catch {
        return text;
    }
}

function summarizeJson(obj, depth = 0, maxDepth = 2) {
    if (depth > maxDepth) return '...';
    const indent = '  '.repeat(depth);

    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        const keys = Object.keys(obj);
        if (!keys.length) return '{}';
        const result = ['{'];
        keys.slice(0, 5).forEach(key => {
            const val = obj[key];
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                result.push(`${indent}  ${key}: <dict>`);
            } else if (Array.isArray(val)) {
                const itemType = val.length ? typeof val[0] : 'any';
                result.push(`${indent}  ${key}: <list[${itemType}] x${val.length}>`);
            } else {
                result.push(`${indent}  ${key}: ${String(val).slice(0, 30)}`);
            }
        });
        if (keys.length > 5) result.push(`${indent}  ... +${keys.length - 5}`);
        result.push(`${indent}}`);
        return result.join('\n');
    } else if (Array.isArray(obj)) {
        if (!obj.length) return '[]';
        return `<list[${typeof obj[0]}] x${obj.length}>\nfirst: ${String(obj[0]).slice(0, 80)}`;
    }
    return String(obj).slice(0, 50);
}

function filterLog(text) {
    const lines = text.trim().split('\n');
    const errors = [];
    const warnings = [];
    const lastInfo = [];

    for (const line of lines) {
        const upper = line.toUpperCase();
        if (/ERROR|FATAL|EXCEPTION|CRITICAL/.test(upper)) {
            errors.push(compactLog(line, '❌'));
        } else if (upper.includes('WARN')) {
            warnings.push(compactLog(line, '⚠️'));
        } else if (/INFO|DEBUG/.test(upper)) {
            lastInfo.push(line.trim());
        }
    }

    const dedup = (items) => {
        const seen = new Set();
        return items.filter(item => {
            const key = item.replace(/\d+/g, 'N').slice(0, 50);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    const dedupedErrors = dedup(errors);
    const dedupedWarnings = dedup(warnings);

    const result = [];
    if (dedupedErrors.length) {
        result.push(`=== ${dedupedErrors.length} errors ===`);
        result.push(...dedupedErrors.slice(0, 15));
    }
    if (dedupedWarnings.length) {
        result.push(`\n=== ${dedupedWarnings.length} warnings ===`);
        result.push(...dedupedWarnings.slice(0, 10));
    }
    if (!dedupedErrors.length && !dedupedWarnings.length) {
        result.push(`✓ No errors/warnings (${lastInfo.length} info lines)`);
        result.push(...lastInfo.slice(-3));
    }
    return result.join('\n');
}

function compactLog(line, prefix) {
    line = line.replace(/\d{4}-\d{2}-\d{2}\s+/, '');
    return `${prefix} ${line.trim().slice(0, 90)}`;
}

function filterLs(text) {
    const lines = text.trim().split('\n');
    const result = [];

    for (const line of lines) {
        if (line.startsWith('total')) continue;
        const match = line.match(/^([d-][rwx-]{9})\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\S+\s+\S+\s+(.+)$/);
        if (match) {
            const [, perm, size, name] = match;
            const sizeInt = parseInt(size);
            const sizeStr = sizeInt > 1024*1024 ? `${Math.floor(sizeInt/(1024*1024))}M` :
                           sizeInt > 1024 ? `${Math.floor(sizeInt/1024)}K` : `${sizeInt}B`;
            result.push(`${perm} ${sizeStr.padStart(6)} ${name}`);
        } else if (line.trim()) {
            result.push(line.trim().slice(0, 80));
        }
    }

    if (result.length > 30) {
        return result.slice(0, 25).join('\n') + `\n... +${result.length - 25} files`;
    }
    return result.join('\n');
}

function filterGrep(text) {
    const lines = text.trim().split('\n');
    const groups = {};

    for (const line of lines) {
        const match = line.match(/^([^:]+):(\d+):(.*)$/);
        if (match) {
            const [, file, lineNum, content] = match;
            if (!groups[file]) groups[file] = [];
            groups[file].push(`  L${lineNum}: ${content.trim().slice(0, 80)}`);
        }
    }

    const totalMatches = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0);
    const result = [`📁 ${Object.keys(groups).length} files, ${totalMatches} matches`];

    Object.entries(groups).slice(0, 10).forEach(([file, matches]) => {
        result.push(`\n${file}: (${matches.length} matches)`);
        result.push(...matches.slice(0, 5));
        if (matches.length > 5) result.push(`  ... +${matches.length - 5}`);
    });

    return result.join('\n');
}

function filterCsv(text) {
    const lines = text.trim().split('\n');
    if (!lines.length) return text;

    const header = lines[0].split(',');
    const rows = lines.slice(1).filter(l => l.trim()).map(l => l.split(','));

    const result = [`CSV: ${header.length} cols, ${rows.length} rows`];
    result.push(`Headers: ${header.slice(0, 8).map(h => h.trim().slice(0, 20)).join(', ')}`);
    if (header.length > 8) result.push(`  ... +${header.length - 8} cols`);

    if (rows.length) {
        result.push(`\nFirst row: ${rows[0].slice(0, 5).map(c => c.trim().slice(0, 15)).join(',')}`);
        result.push(`Last row:  ${rows[rows.length-1].slice(0, 5).map(c => c.trim().slice(0, 15)).join(',')}`);
    }
    return result.join('\n');
}

function filterDocker(text) {
    const lines = text.trim().split('\n');
    if (lines[0] && lines[0].includes('CONTAINER ID')) {
        const result = [];
        for (const line of lines.slice(1)) {
            const parts = line.trim().split(/\s{2,}/);
            if (parts.length >= 4) {
                const containerId = parts[0].slice(0, 8);
                const status = parts[3] || '';
                const name = parts[parts.length - 1] || '';
                result.push(`${containerId} ${name.padEnd(20)} ${status.slice(0, 30)}`);
            }
        }
        return `${result.length} containers\n${result.join('\n')}`;
    }
    return filterLog(text);
}

function filterStackTrace(text) {
    const lines = text.trim().split('\n');
    let errorMsg = '';
    const traceback = [];
    let inTraceback = false;

    for (const line of lines) {
        if (/Traceback|Error:|Exception:/.test(line)) {
            inTraceback = true;
            errorMsg = line.trim().slice(0, 100);
        } else if (inTraceback && line.startsWith('  File ')) {
            const match = line.match(/File "([^"]+)", line (\d+), in (\w+)/);
            if (match) {
                const [, file, lineNum, func] = match;
                const shortFile = file.split('/').pop();
                traceback.push(`  ${shortFile}:${lineNum} (${func})`);
            }
        } else if (inTraceback && line.trim() && !line.startsWith(' ')) {
            errorMsg = line.trim().slice(0, 100);
        }
    }

    const result = [`❌ ${errorMsg}`];
    if (traceback.length) {
        result.push(`\nStack (${traceback.length} frames):`);
        if (traceback.length > 6) {
            result.push(...traceback.slice(0, 3));
            result.push(`  ... +${traceback.length - 6}`);
            result.push(...traceback.slice(-3));
        } else {
            result.push(...traceback);
        }
    }
    return result.join('\n');
}

function filterGeneric(text) {
    const lines = text.trim().split('\n');
    if (lines.length > 80) {
        return lines.slice(0, 50).join('\n') + `\n... +${lines.length - 50} lines\n` + lines.slice(-10).join('\n');
    }
    return lines.filter(l => l.trim()).map(l => l.slice(0, 120)).join('\n');
}

// 글로벌 노출
window.homerCompress = homerCompress;
