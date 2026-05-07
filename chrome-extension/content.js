// content.js - ChatGPT/Claude 페이지에 압축 버튼 주입

(function() {
    'use strict';

    let compressBtn = null;
    let lastTextarea = null;
    let observerActive = false;

    // 압축 버튼 생성
    function createCompressButton() {
        const btn = document.createElement('button');
        btn.id = 'caveman-compress-btn';
        btn.innerHTML = '🦣 압축';
        btn.title = 'Caveman으로 프롬프트 압축 (Ctrl+Shift+C)';
        btn.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            z-index: 999999;
            padding: 10px 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px) scale(1.05)';
            btn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        });

        btn.addEventListener('click', compressActive);

        return btn;
    }

    // 활성 입력창 찾기
    function findActiveInput() {
        const selectors = [
            'textarea#prompt-textarea',                  // ChatGPT
            'textarea[placeholder*="Message"]',           // ChatGPT 변형
            'div[contenteditable="true"][role="textbox"]', // Claude
            'div[contenteditable="true"].ProseMirror',     // Claude 신버전
            'rich-textarea div[contenteditable="true"]',   // Gemini
            'textarea',
        ];

        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && (el.value !== undefined ? el.value : el.innerText).trim().length > 30) {
                return el;
            }
        }
        return null;
    }

    // 활성 입력창의 텍스트 압축
    function compressActive() {
        const input = findActiveInput();
        if (!input) {
            showToast('압축할 텍스트를 입력창에 작성해주세요 (30자 이상)');
            return;
        }

        const isTextarea = input.tagName === 'TEXTAREA';
        const original = isTextarea ? input.value : input.innerText;

        if (!original.trim()) {
            showToast('빈 입력창입니다');
            return;
        }

        // 강도 선택 (저장된 설정)
        chrome.storage.local.get({ level: 'full' }, (result) => {
            const compressed = window.caveman(original, result.level);
            const origTokens = window.cavemanEstimateTokens(original);
            const newTokens = window.cavemanEstimateTokens(compressed);
            const saved = origTokens > 0 ? Math.round((1 - newTokens / origTokens) * 100) : 0;

            // 입력창에 적용
            if (isTextarea) {
                // React/Vue 호환 setValue
                const setter = Object.getOwnPropertyDescriptor(
                    Object.getPrototypeOf(input),
                    'value'
                ).set;
                setter.call(input, compressed);
                input.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                // contenteditable
                input.innerText = compressed;
                input.dispatchEvent(new InputEvent('input', { bubbles: true }));
            }

            showToast(`✅ ${origTokens} → ${newTokens} 토큰 (${saved}% 절감!)`);
        });
    }

    // 토스트 메시지
    function showToast(message) {
        const existing = document.getElementById('caveman-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'caveman-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 160px;
            right: 30px;
            z-index: 999999;
            padding: 12px 20px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            animation: cavemanFadeIn 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // 키보드 단축키 (Ctrl+Shift+C)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            compressActive();
        }
    });

    // 버튼 주입
    function inject() {
        if (document.getElementById('caveman-compress-btn')) return;
        if (!document.body) return;
        compressBtn = createCompressButton();
        document.body.appendChild(compressBtn);
    }

    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cavemanFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    // 초기 주입 + DOM 변경 감지
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }

    // SPA 라우팅 변경 시 다시 주입
    new MutationObserver(() => {
        if (!document.getElementById('caveman-compress-btn')) inject();
    }).observe(document.body, { childList: true, subtree: false });
})();
