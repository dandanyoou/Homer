// background.js - Service Worker
// 우클릭 컨텍스트 메뉴 등록 + 압축 처리

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'caveman-compress',
        title: '🦣 Caveman으로 압축',
        contexts: ['selection']
    });

    chrome.contextMenus.create({
        id: 'caveman-compress-copy',
        title: '🦣 압축 후 클립보드 복사',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'caveman-compress' || info.menuItemId === 'caveman-compress-copy') {
        const copy = info.menuItemId === 'caveman-compress-copy';
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: compressInTab,
            args: [info.selectionText, copy]
        });
    }
});

// 페이지 컨텍스트에서 실행되는 함수 (caveman.js가 이미 로드된 상태)
function compressInTab(selectedText, copyToClipboard) {
    if (typeof window.caveman !== 'function') {
        alert('Caveman 함수가 로드되지 않았습니다.');
        return;
    }

    chrome.storage.local.get({ level: 'full' }, (result) => {
        const compressed = window.caveman(selectedText, result.level);
        const origTokens = window.cavemanEstimateTokens(selectedText);
        const newTokens = window.cavemanEstimateTokens(compressed);
        const saved = origTokens > 0 ? Math.round((1 - newTokens / origTokens) * 100) : 0;

        if (copyToClipboard) {
            navigator.clipboard.writeText(compressed).then(() => {
                showInPageToast(`✅ 클립보드 복사 완료! ${saved}% 절감 (${origTokens}→${newTokens})`);
            });
        } else {
            // 새 창으로 결과 표시
            const win = window.open('', '_blank', 'width=600,height=500');
            win.document.write(`
                <!DOCTYPE html>
                <html><head><meta charset="UTF-8"><title>Caveman 결과</title>
                <style>
                    body{font-family:-apple-system,sans-serif;padding:20px;background:#f5f5f5;}
                    h1{color:#667eea;}
                    .stats{background:white;padding:15px;border-radius:8px;margin:10px 0;}
                    pre{background:white;padding:15px;border-radius:8px;white-space:pre-wrap;word-wrap:break-word;}
                    button{padding:10px 20px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;}
                </style>
                </head><body>
                <h1>🦣 Caveman 압축 결과</h1>
                <div class="stats">
                    <strong>원본:</strong> ${origTokens} 토큰<br>
                    <strong>압축:</strong> ${newTokens} 토큰<br>
                    <strong>절감:</strong> ${saved}%
                </div>
                <h3>압축 결과:</h3>
                <pre id="result">${compressed.replace(/</g, '&lt;')}</pre>
                <button onclick="navigator.clipboard.writeText(document.getElementById('result').innerText);this.textContent='✓ 복사됨!'">복사</button>
                </body></html>
            `);
        }
    });

    function showInPageToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position:fixed;bottom:30px;right:30px;z-index:999999;
            padding:12px 20px;background:rgba(0,0,0,0.85);color:white;
            border-radius:8px;font-size:14px;
            font-family:-apple-system,sans-serif;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}
