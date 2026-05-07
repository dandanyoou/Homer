// Caveman compress.js v0.3
// 한국어 + 영어 압축 + 강도 옵션 (Lite/Full/Ultra)

function compress() {
    const inputArea = document.getElementById('caveman-input') || document.getElementById('input');
    const outputArea = document.getElementById('caveman-output') || document.getElementById('output');
    const input = inputArea.value.trim();

    if (!input) {
        alert('프롬프트를 입력해주세요');
        return;
    }

    // 강도 옵션 (있으면 사용)
    const levelEl = document.getElementById('caveman-level');
    const level = levelEl ? levelEl.value : 'full';
    const lang = detectLanguage(input);

    const compressed = caveman(input, level, lang);
    outputArea.value = compressed;

    updateStats();
}

function detectLanguage(text) {
    const koreanCount = (text.match(/[가-힯]/g) || []).length;
    const englishCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (koreanCount > englishCount * 0.3) return 'ko';
    if (englishCount > koreanCount * 2) return 'en';
    return 'mixed';
}

function caveman(text, level = 'full', lang = 'mixed') {
    let result = text;

    // ============================================
    // [한국어 압축 규칙]
    // ============================================
    if (lang === 'ko' || lang === 'mixed') {
        // 군더더기 서두 제거
        result = result
            .replace(/^.*?(제|우리|저는|이는|다음과 같이|먼저|일단)\s+/gm, '')
            .replace(/어떻게\s+(도움|설명|제시|말씀)드릴까.*?$/gm, '')
            .replace(/안녕하세요[.,]?\s*/g, '')
            .replace(/반갑습니다[.,]?\s*/g, '');

        // 약한 표현/불확실성 제거
        result = result
            .replace(/\s*(혹시|아마|어쩌면|것\s+같다|것\s+같습니다|것\s+같은|것\s+같으면)\s*/g, ' ')
            .replace(/\s*(어떨까\s+싶|어떨까\s+합)\s*/g, ' ')
            .replace(/\s*(생각해\s+봅시다|봐야\s+합|봐야\s+할)\s*/g, ' ');

        // 존댓말 제거
        result = result
            .replace(/\s*(습니다|합니다|입니다|있습니다|됩니다|겠습니다|하겠습니다)\.?\s*/g, ' ')
            .replace(/\s*(습니까|합니까|있습니까)\.?\s*/g, '? ')
            .replace(/\s*(말씀드립니다|드립니다|말씀합니다)\.?\s*/g, ' ');

        // 주어 생략
        result = result
            .replace(/\b(저는|나는|우리는|이것은|이는|그것은|그는|그녀는|당신은)\s+/g, '');

        // 접속사 제거
        result = result
            .replace(/\s*(그리고|그런데|그래서|또한|더불어|한편|다만|그럼|아울러|따라서|그러므로)\s*/g, ' ');

        // 수식어 제거
        result = result
            .replace(/\s*(매우|아주|정말|상당히|좀|꽤|특히|바로|곧|거의|많이|완전히)\s*/g, ' ');

        // 이유/설명 문구
        result = result
            .replace(/\s*(이유는|이유가|원인은|원인이|이유로는|이유로)\s*/g, ' ')
            .replace(/\s*(때문에|때문입니다|까닭에|까닭입니다)\.?\s*/g, ' ');

        // 마무리 표현
        result = result
            .replace(/\s*(참고\s+부탁|감사합니다|감사드립니다|알겠습니까|확인\s+부탁|궁금한\s+점|질문\s+있으시면)\.?\s*/g, '');
    }

    // ============================================
    // [영어 압축 규칙 - 대폭 강화]
    // ============================================
    if (lang === 'en' || lang === 'mixed') {
        // [Lite+] 인사 및 군더더기 서두 (8-10토큰 절감)
        result = result
            .replace(/^(sure|certainly|of\s+course|absolutely|definitely)[,.]?\s+/gmi, '')
            .replace(/^(hi|hello|hey|greetings)[,.]?\s+/gmi, '')
            .replace(/i'?d?\s+be\s+(happy|glad|delighted)\s+to\s+/gi, '')
            .replace(/i\s+(would|will|can|could)?\s*(be\s+happy\s+to\s+)?help\s+(you|out)\s*/gi, '')
            .replace(/let\s+me\s+(explain|break\s+down|clarify|take\s+a\s+look|see|check|help)\s+(this|that|it)?\s*/gi, '')
            .replace(/here'?s?\s+(my|the|a\s+brief|why)\s+/gi, '')
            .replace(/i\s+think\s+(that\s+)?/gi, '')
            .replace(/in\s+my\s+opinion[,.]?\s*/gi, '')
            .replace(/it\s+seems\s+(that\s+|like\s+)?/gi, '')
            .replace(/it\s+(appears|looks)\s+(that\s+|like\s+)?/gi, '');

        // 이유 설명 서두 (7토큰 절감)
        result = result
            .replace(/the\s+reason\s+(this|that|it)?\s*(is|that)\s+(happening|occurring)?\s*(is\s+)?(because|due\s+to)?\s*/gi, '')
            .replace(/this\s+is\s+because\s+/gi, '')
            .replace(/the\s+(main\s+)?cause\s+is\s+/gi, '')
            .replace(/that'?s?\s+because\s+/gi, '');

        // 권고 표현 (7토큰 절감)
        result = result
            .replace(/i\s+would\s+recommend\s+(that\s+you\s+)?(consider\s+)?/gi, '')
            .replace(/i\s+(would\s+)?suggest\s+(that\s+you\s+)?/gi, '')
            .replace(/(you\s+)?might\s+want\s+to\s+(consider\s+)?/gi, '')
            .replace(/(you\s+)?could\s+(consider\s+|try\s+to\s+)?/gi, '')
            .replace(/it\s+would\s+be\s+(best|good|wise)\s+to\s+/gi, '')
            .replace(/please\s+(feel\s+free\s+to\s+|don'?t\s+hesitate\s+to\s+)?/gi, '');

        // 군더더기 도입부 (10토큰 절감)
        result = result
            .replace(/let\s+me\s+take\s+a\s+look\s+at\s+(this|that|it)\s+for\s+you\s*/gi, '')
            .replace(/i'?ll\s+(try\s+to\s+)?/gi, '')
            .replace(/allow\s+me\s+to\s+/gi, '')
            .replace(/it'?s?\s+(worth|important)\s+(noting|mentioning|remembering)\s+(that\s+)?/gi, '')
            .replace(/(first|firstly)\s+of\s+all[,.]?\s*/gi, '')
            .replace(/to\s+(begin|start)\s+with[,.]?\s*/gi, '')
            .replace(/in\s+conclusion[,.]?\s*/gi, '')
            .replace(/at\s+the\s+end\s+of\s+the\s+day[,.]?\s*/gi, '');

        // 약한 한정사
        result = result
            .replace(/\s*(very|really|quite|rather|extremely|absolutely|definitely|just|simply|basically|essentially)\s+/gi, ' ');

        // 접속사
        result = result
            .replace(/\s+(and|but|however|moreover|furthermore|nevertheless|additionally)\s+/gi, ' ');

        // 마무리 표현
        result = result
            .replace(/(thanks\s+for|let\s+me\s+know|feel\s+free\s+to|don'?t\s+hesitate|if\s+you\s+have\s+any\s+questions?|hope\s+(this|that)\s+helps)/gi, '');

        // FULL 또는 ULTRA에서 관사 제거
        if (level === 'full' || level === 'ultra') {
            result = result
                .replace(/\b(a|an|the)\s+/gi, '');
        }

        // ULTRA에서 더 공격적
        if (level === 'ultra') {
            // be 동사 생략
            result = result
                .replace(/\s+(is|are|was|were|be|been|being|am)\s+/gi, ' ')
                .replace(/\b(this|that|these|those)\s+/gi, '');

            // 일반적 동사 → 짧은 형태
            result = result
                .replace(/\butilize\b/gi, 'use')
                .replace(/\binitiate\b/gi, 'start')
                .replace(/\bterminate\b/gi, 'end')
                .replace(/\bdemonstrate\b/gi, 'show')
                .replace(/\bpurchase\b/gi, 'buy')
                .replace(/\bin\s+order\s+to\b/gi, 'to')
                .replace(/\bdue\s+to\s+the\s+fact\s+that\b/gi, 'because')
                .replace(/\bat\s+this\s+(point|time|moment)\b/gi, 'now')
                .replace(/\bas\s+a\s+result\s+of\b/gi, 'from');
        }

        // 주어 생략 (Lite는 보존, Full+는 제거)
        if (level !== 'lite') {
            result = result
                .replace(/\b(i\s+am|i'm|i\s+have|i've|we\s+are|we're|it\s+is|it's|that\s+is|that's|you\s+are|you're)\s+/gi, '');
        }
    }

    // ============================================
    // [공통 - 마크다운, 공백, 정리]
    // ============================================
    result = result
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1');

    // 공백 정리
    result = result
        .replace(/\s+/g, ' ')
        .replace(/\s+([.,!?;:])/g, '$1')
        .replace(/([.,!?;:])\s+/g, '$1 ');

    // ULTRA: 쉼표도 공백으로
    if (level === 'ultra') {
        result = result.replace(/\s*,\s*/g, ' ');
    }

    // 문장 분리
    result = result
        .replace(/([.!?])\s+(?=[가-힣A-Z])/g, '$1\n')
        .split('\n')
        .map(line => line.trim().replace(/\s+/g, ' '))
        .filter(line => line.length > 2)
        .join('\n');

    // 반복 제거
    const lines = result.split('\n');
    const uniqueLines = [];
    const seen = new Set();
    for (const line of lines) {
        const simplified = line.toLowerCase().replace(/[.,!?;:]/g, '').slice(0, 40);
        if (!seen.has(simplified) && line.length > 0) {
            uniqueLines.push(line);
            seen.add(simplified);
        }
    }
    result = uniqueLines.join('\n');

    // 최종 정리
    result = result
        .trim()
        .replace(/\n\s*\n/g, '\n')
        .replace(/^\s*[-*•]\s+/gm, '');

    return result;
}

function updateStats() {
    const inputArea = document.getElementById('caveman-input') || document.getElementById('input');
    const outputArea = document.getElementById('caveman-output') || document.getElementById('output');
    const input = inputArea.value;
    const output = outputArea.value;

    const inputTokens = estimateTokens(input);
    const outputTokens = estimateTokens(output);
    const ratio = inputTokens > 0 ? Math.round((1 - outputTokens / inputTokens) * 100) : 0;
    const savings = Math.max(0, inputTokens - outputTokens) * 0.015;

    document.getElementById('inputTokens').textContent = inputTokens;
    document.getElementById('outputTokens').textContent = outputTokens;
    document.getElementById('ratio').textContent = ratio + '%';
    document.getElementById('savings').textContent = '₩' + Math.round(savings * 1200);
}

function estimateTokens(text) {
    if (!text) return 0;
    const koreanCount = (text.match(/[가-힯]/g) || []).length;
    const englishWords = text.split(/\s+/).filter(w => /[a-zA-Z]/.test(w)).length;
    return Math.ceil(koreanCount + englishWords * 1.3);
}

function copyOutput() {
    const outputArea = document.getElementById('caveman-output') || document.getElementById('output');
    if (!outputArea.value) {
        alert('복사할 내용이 없습니다');
        return;
    }
    navigator.clipboard.writeText(outputArea.value).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ 복사됨!';
        setTimeout(() => btn.textContent = originalText, 2000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('caveman-input') || document.getElementById('input');
    if (inputArea) {
        inputArea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') compress();
        });
    }
});
