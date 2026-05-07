// popup.js - 확장 팝업 로직

document.addEventListener('DOMContentLoaded', () => {
    const levelSelect = document.getElementById('level');
    const input = document.getElementById('quick-input');
    const output = document.getElementById('quick-output');
    const compressBtn = document.getElementById('compress-btn');
    const copyBtn = document.getElementById('copy-btn');

    // 저장된 강도 로드
    chrome.storage.local.get({ level: 'full' }, (result) => {
        levelSelect.value = result.level;
    });

    // 강도 변경 시 저장
    levelSelect.addEventListener('change', () => {
        chrome.storage.local.set({ level: levelSelect.value });
    });

    // 압축 버튼
    compressBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) {
            alert('텍스트를 입력해주세요');
            return;
        }

        const compressed = caveman(text, levelSelect.value);
        output.value = compressed;

        const origTokens = cavemanEstimateTokens(text);
        const newTokens = cavemanEstimateTokens(compressed);
        const saved = origTokens > 0 ? Math.round((1 - newTokens / origTokens) * 100) : 0;

        document.getElementById('orig-tokens').textContent = origTokens;
        document.getElementById('new-tokens').textContent = newTokens;
        document.getElementById('ratio').textContent = saved + '%';
    });

    // 복사 버튼
    copyBtn.addEventListener('click', () => {
        if (!output.value) {
            alert('복사할 내용이 없습니다');
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            const orig = copyBtn.textContent;
            copyBtn.textContent = '✓ 복사됨!';
            setTimeout(() => copyBtn.textContent = orig, 1500);
        });
    });

    // Enter (Ctrl+Enter)로 압축
    input.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            compressBtn.click();
        }
    });
});
