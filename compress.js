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

    // 1단계: 존댓말 제거 및 불필요한 표현 정리
    result = result
        .replace(/\s*습니다\.?\s*/g, ' ') // 습니다 제거
        .replace(/\s*합니다\.?\s*/g, ' ') // 합니다 제거
        .replace(/\s*입니다\.?\s*/g, ' ') // 입니다 제거
        .replace(/\s*있습니다\.?\s*/g, '') // 있습니다 제거
        .replace(/\s*됩니다\.?\s*/g, ''); // 됩니다 제거

    // 2단계: 불필요한 접속사 제거
    result = result
        .replace(/그리고\s*/g, '') // 그리고
        .replace(/그런데\s*/g, '') // 그런데
        .replace(/그래서\s*/g, '') // 그래서
        .replace(/또한\s*/g, '') // 또한
        .replace(/더불어\s*/g, '') // 더불어
        .replace(/한편\s*/g, '') // 한편
        .replace(/다만\s*/g, '') // 다만
        .replace(/그럼\s*/g, '') // 그럼
        .replace(/아울러\s*/g, ''); // 아울러

    // 3단계: 불필요한 수식어 제거
    result = result
        .replace(/\s*매우\s*/g, ' ')
        .replace(/\s*아주\s*/g, ' ')
        .replace(/\s*특히\s*/g, ' ')
        .replace(/\s*정말\s*/g, ' ')
        .replace(/\s*바로\s*/g, ' ')
        .replace(/\s*곧\s*/g, ' ');

    // 4단계: 마크다운 형식 정리
    result = result
        .replace(/#{1,6}\s+/g, '') // # 제목
        .replace(/\*\*(.*?)\*\*/g, '$1') // 굵게
        .replace(/\*(.*?)\*/g, '$1') // 기울임
        .replace(/__(.*?)__/g, '$1') // 굵게 (언더스코어)
        .replace(/_(.*?)_/g, '$1') // 기울임 (언더스코어)
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1'); // 링크

    // 5단계: 공백 정리
    result = result
        .replace(/\s+/g, ' ') // 연속된 공백을 1개로
        .replace(/\s+([.,!?;:])/g, '$1') // 구두점 전 공백 제거
        .replace(/([.,!?;:])\s+/g, '$1 '); // 구두점 후 공백 정리

    // 6단계: 불필요한 개행 정리
    result = result
        .replace(/\n\s*\n/g, '\n') // 빈 줄 제거
        .replace(/\n/g, ' '); // 개행을 공백으로

    // 7단계: 불필요한 설명문 줄이기
    result = result
        .replace(/\. /g, '.\n') // 문장 끝에서 개행
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');

    // 8단계: 반복 문장 제거 (간단한 버전)
    const lines = result.split('\n');
    const uniqueLines = [];
    const seen = new Set();

    for (const line of lines) {
        const simplified = line.toLowerCase().slice(0, 30); // 처음 30자로 비교
        if (!seen.has(simplified)) {
            uniqueLines.push(line);
            seen.add(simplified);
        }
    }

    result = uniqueLines.join('\n');

    // 9단계: 최종 공백 정리
    result = result.trim();

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
