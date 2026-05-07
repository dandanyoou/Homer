function compress() {
    const inputArea = document.getElementById('input');
    const outputArea = document.getElementById('output');
    const input = inputArea.value.trim();

    if (!input) {
        alert('프롬프트를 입력해주세요');
        return;
    }

    // 압축 수행
    const compressed = caveman(input);
    outputArea.value = compressed;

    // 통계 업데이트
    updateStats();
}

function caveman(text) {
    let result = text;

    // [LEVEL 1] 군더더기 서두 완전 제거
    result = result
        // 한국어 과도한 서두
        .replace(/^.*?(제|우리|저는|이는|다음과 같이|먼저)\s+/gm, '')
        .replace(/어떻게\s+(도움|설명|제시|말씀)드릴까.*?$/gm, '개요:')
        // 영어 과도한 서두
        .replace(/^sure,?\s+i'?d?\s+(be\s+happy\s+to|like\s+to|help\s+you|take\s+a\s+look)/gmi, '')
        .replace(/^the\s+reason\s+(this\s+is|that\s+is)/gmi, '')
        .replace(/^let\s+me\s+(explain|break\s+down|clarify)/gmi, '')
        .replace(/^here'?s?\s+(my|the|a\s+brief|why)/gmi, '');

    // [LEVEL 2] 약한 표현/불확실성 제거
    result = result
        .replace(/\s*(혹시|아마|어쩌면|것\s+같다|것\s+같습니다|것\s+같은|것\s+같으면)\s*/g, ' ')
        .replace(/\s*(어떨까\s+싶|어떨까\s+합)\s*/g, ' ')
        .replace(/\s*(생각해\s+봅시다|봐야\s+합|봐야\s+할)\s*/g, ' ')
        .replace(/\s*try\s+to\s*/gi, ' ')
        .replace(/\s*might\s+want\s+to\s*/gi, ' ')
        .replace(/\s*could\s+consider\s*/gi, ' ')
        .replace(/\s*i\s+would\s+recommend\s+that\s+you\s*/gi, '');

    // [LEVEL 3] 존댓말/높임말 → 반말로
    result = result
        .replace(/\s*(습니다|합니다|입니다|있습니다|됩니다|겠습니다|하겠습니다)\.?\s*/g, ' ')
        .replace(/\s*(습니까|합니까|있습니까)\.?\s*/g, ' ')
        .replace(/\s*(말씀드립니다|드립니다|말씀합니다)\.?\s*/g, ' ')
        .replace(/\s*(하셔야|하세요|해야|하면)\s*/g, '하면 ');

    // [LEVEL 4] 주어 생략 (caveman style)
    result = result
        .replace(/\b(저는|나는|우리는|이것은|이는|그것은|그는|그녀는|당신은)\s+/g, '')
        .replace(/\b(i\s+am|i\s+have|we\s+are|this\s+is|it\s+is|you\s+are)\b/gi, '');

    // [LEVEL 5] 불필요한 접속사 제거
    result = result
        .replace(/\s*(그리고|그런데|그래서|또한|더불어|한편|다만|그럼|아울러|따라서|그러므로)\s*/g, ' ')
        .replace(/\s*(and|but|however|moreover|furthermore|nevertheless)\s*/gi, ' ')
        .replace(/\s*,\s*/g, ' '); // 쉼표도 공백으로

    // [LEVEL 6] 불필요한 수식어 제거
    result = result
        .replace(/\s*(매우|아주|정말|매우|상당히|좀|꽤|특히|바로|곧|거의|많이|좋게|나쁘게|완전히)\s*/g, ' ')
        .replace(/\s*(very|really|quite|rather|extremely|absolutely|definitely)\s*/gi, ' ');

    // [LEVEL 7] 이유/설명 문구 제거
    result = result
        .replace(/\s*(이유는|이유가|원인은|원인이|이유로는|이유로)\s*/g, ' ')
        .replace(/\s*(때문에|때문입니다|까닭에|까닭입니다)\.?\s*/g, ' ')
        .replace(/\s*(why.*?:\s*|because\s+|the\s+reason.*?is|due\s+to)\s*/gi, ' ');

    // [LEVEL 8] 마크다운 형식 정리
    result = result
        .replace(/#{1,6}\s+/g, '') // # 제목
        .replace(/\*\*(.*?)\*\*/g, '$1') // 굵게
        .replace(/\*(.*?)\*/g, '$1') // 기울임
        .replace(/__(.*?)__/g, '$1') // 굵게 (언더스코어)
        .replace(/_(.*?)_/g, '$1') // 기울임 (언더스코어)
        .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // 코드 블록은 유지
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1'); // 링크는 텍스트만

    // [LEVEL 9] 불필요한 마무리 표현
    result = result
        .replace(/\s*(참고\s+부탁|감사합니다|감사드립니다|알겠습니까|확인\s+부탁|궁금한\s+점|질문\s+있으시면)\.?\s*/g, '')
        .replace(/\s*(thanks\s+for|let\s+me\s+know|feel\s+free\s+to|don'?t\s+hesitate|if\s+you.*?questions?)\s*/gi, '');

    // [LEVEL 10] 공백 및 구조 정리
    result = result
        .replace(/\s+/g, ' ') // 연속 공백 → 1개
        .replace(/\s+([.,!?;:])/g, '$1') // 구두점 전 공백 제거
        .replace(/([.,!?;:])\s+/g, '$1 '); // 구두점 후 공백

    // [LEVEL 11] 문장 분리 (개행)
    result = result
        .replace(/([.!?])\s+(?=[가-힣A-Z])/g, '$1\n') // 문장 끝에서 개행
        .split('\n')
        .map(line => {
            line = line.trim();
            // 각 문장 내 불필요한 공백 정리
            return line.replace(/\s+/g, ' ');
        })
        .filter(line => line.length > 3) // 너무 짧은 줄 제거 (3글자 이상)
        .join('\n');

    // [LEVEL 12] 반복 문장 제거
    const lines = result.split('\n');
    const uniqueLines = [];
    const seen = new Set();

    for (const line of lines) {
        // 한글과 영문 모두 처리
        const simplified = line
            .toLowerCase()
            .replace(/[.,!?;:]/g, '') // 구두점 제거
            .slice(0, 40); // 처음 40자 비교

        if (!seen.has(simplified) && line.length > 0) {
            uniqueLines.push(line);
            seen.add(simplified);
        }
    }

    result = uniqueLines.join('\n');

    // [LEVEL 13] 최종 정리
    result = result
        .trim()
        .replace(/\n\s*\n/g, '\n') // 빈 줄 제거
        .replace(/^\s*[-*•]\s+/gm, ''); // 불릿 포인트 제거

    return result;
}

function updateStats() {
    const inputArea = document.getElementById('input');
    const outputArea = document.getElementById('output');
    const input = inputArea.value;
    const output = outputArea.value;

    const inputTokens = estimateTokens(input);
    const outputTokens = estimateTokens(output);
    const ratio = inputTokens > 0 ? Math.round((outputTokens / inputTokens) * 100) : 0;
    const savings = Math.max(0, inputTokens - outputTokens) * 0.015; // 대략 $0.015 per token

    document.getElementById('inputTokens').textContent = inputTokens;
    document.getElementById('outputTokens').textContent = outputTokens;
    document.getElementById('ratio').textContent = ratio + '%';
    document.getElementById('savings').textContent = '₩' + Math.round(savings * 1200); // 환율 1200
}

function estimateTokens(text) {
    if (!text) return 0;
    // 한글: 1글자 ≈ 1 토큰, 영어: 1단어 ≈ 1.3 토큰
    const koreanCount = (text.match(/[가-힯]/g) || []).length;
    const englishWords = text.split(/\s+/).filter(w => /[a-zA-Z]/.test(w)).length;
    return Math.ceil(koreanCount + englishWords * 1.3);
}

function copyOutput() {
    const outputArea = document.getElementById('output');
    if (!outputArea.value) {
        alert('복사할 내용이 없습니다');
        return;
    }

    navigator.clipboard.writeText(outputArea.value).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ 복사됨!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// 엔터 키로 압축하기
document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('input');
    inputArea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            compress();
        }
    });
});
