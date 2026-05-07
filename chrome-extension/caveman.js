// caveman.js - 핵심 압축 로직 (compress.js와 동일)
// content.js 및 popup.js에서 모두 사용

function detectLanguage(text) {
    const koreanCount = (text.match(/[가-힯]/g) || []).length;
    const englishCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (koreanCount > englishCount * 0.3) return 'ko';
    if (englishCount > koreanCount * 2) return 'en';
    return 'mixed';
}

function caveman(text, level = 'full', lang = null) {
    if (!lang) lang = detectLanguage(text);
    let result = text;

    // 한국어
    if (lang === 'ko' || lang === 'mixed') {
        result = result
            .replace(/^.*?(제|우리|저는|이는|다음과 같이|먼저|일단)\s+/gm, '')
            .replace(/안녕하세요[.,]?\s*/g, '')
            .replace(/\s*(혹시|아마|어쩌면|것\s+같다|것\s+같습니다|것\s+같은)\s*/g, ' ')
            .replace(/\s*(습니다|합니다|입니다|있습니다|됩니다|겠습니다)\.?\s*/g, ' ')
            .replace(/\b(저는|나는|우리는|이것은|이는|그것은)\s+/g, '')
            .replace(/\s*(그리고|그런데|그래서|또한|더불어|한편|따라서)\s*/g, ' ')
            .replace(/\s*(매우|아주|정말|상당히|꽤|특히|바로|곧|많이|완전히)\s*/g, ' ')
            .replace(/\s*(때문에|때문입니다|까닭에)\.?\s*/g, ' ')
            .replace(/\s*(감사합니다|확인\s+부탁|궁금한\s+점)\.?\s*/g, '');
    }

    // 영어
    if (lang === 'en' || lang === 'mixed') {
        result = result
            .replace(/^(sure|certainly|of\s+course|absolutely)[,.]?\s+/gmi, '')
            .replace(/^(hi|hello|hey)[,.]?\s+/gmi, '')
            .replace(/i'?d?\s+be\s+(happy|glad|delighted)\s+to\s+/gi, '')
            .replace(/let\s+me\s+(explain|break\s+down|clarify|take\s+a\s+look|see|check|help)\s+(this|that|it)?\s*/gi, '')
            .replace(/here'?s?\s+(my|the|a\s+brief|why)\s+/gi, '')
            .replace(/i\s+think\s+(that\s+)?/gi, '')
            .replace(/in\s+my\s+opinion[,.]?\s*/gi, '')
            .replace(/it\s+seems\s+(that\s+|like\s+)?/gi, '')
            .replace(/the\s+reason\s+(this|that|it)?\s*(is|that)\s+(happening)?\s*(is\s+)?(because)?\s*/gi, '')
            .replace(/i\s+would\s+recommend\s+(that\s+you\s+)?(consider\s+)?/gi, '')
            .replace(/(you\s+)?might\s+want\s+to\s+(consider\s+)?/gi, '')
            .replace(/please\s+(feel\s+free\s+to\s+|don'?t\s+hesitate\s+to\s+)?/gi, '')
            .replace(/it\s+(is|was)\s+(worth|important)\s+(noting|mentioning|remembering)\s+(that\s+)?/gi, '')
            .replace(/(first|firstly)\s+of\s+all[,.]?\s*/gi, '')
            .replace(/in\s+conclusion[,.]?\s*/gi, '')
            .replace(/\s*(very|really|quite|rather|extremely|absolutely|definitely|just|basically|essentially)\s+/gi, ' ')
            .replace(/\s+(and|but|however|moreover|furthermore|nevertheless)\s+/gi, ' ')
            .replace(/(thanks\s+for|let\s+me\s+know|feel\s+free\s+to|don'?t\s+hesitate|hope\s+(this|that)\s+helps)/gi, '');

        if (level === 'full' || level === 'ultra') {
            result = result.replace(/\b(a|an|the)\s+/gi, '');
        }

        if (level === 'ultra') {
            result = result
                .replace(/\s+(is|are|was|were|be|been|being|am)\s+/gi, ' ')
                .replace(/\butilize\b/gi, 'use')
                .replace(/\bin\s+order\s+to\b/gi, 'to')
                .replace(/\bdue\s+to\s+the\s+fact\s+that\b/gi, 'because');
        }

        if (level !== 'lite') {
            result = result.replace(/\b(i\s+am|i'm|we\s+are|we're|it\s+is|it's|that's|you're)\s+/gi, '');
        }
    }

    // 마크다운 정리
    result = result
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1');

    // 공백 정리
    result = result
        .replace(/\s+/g, ' ')
        .replace(/\s+([.,!?;:])/g, '$1')
        .replace(/([.!?])\s+(?=[가-힣A-Z])/g, '$1\n')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 2)
        .join('\n');

    // 반복 제거
    const seen = new Set();
    const lines = result.split('\n').filter(line => {
        const key = line.toLowerCase().replace(/[.,!?;:]/g, '').slice(0, 40);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return lines.join('\n').trim();
}

function estimateTokens(text) {
    if (!text) return 0;
    const korean = (text.match(/[가-힯]/g) || []).length;
    const eng = text.split(/\s+/).filter(w => /[a-zA-Z]/.test(w)).length;
    return Math.ceil(korean + eng * 1.3);
}

// 글로벌 노출 (content.js, popup.js에서 사용)
if (typeof window !== 'undefined') {
    window.caveman = caveman;
    window.cavemanEstimateTokens = estimateTokens;
}
