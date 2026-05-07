# 📣 마케팅 공유 자료

플랫폼별로 공유할 글 모음입니다. 복사해서 그대로 사용하세요.

---

## 1. Hacker News (Show HN)

**제목 (둘 중 하나):**
```
Show HN: Token Optimizer – Compress LLM prompts and CLI outputs in browser
```
또는
```
Show HN: Homer – CLI output compressor that beats rtk (avg 81% reduction)
```

**본문:**
```
Hi HN,

I built two tools that solve different sides of the same problem: AI tokens are 
expensive, and we waste a lot of them.

🦣 Caveman compresses prompts. It strips polite filler ("I would recommend that 
you consider..."), redundant phrases, and articles. Korean and English support.

🍩 Homer compresses CLI outputs before sending to LLMs. Inspired by rtk but goes 
further: 10 format-aware filters (git, test, JSON, logs, CSV, Docker, stack 
traces, etc). Average 81.6% reduction in my benchmark vs rtk's claimed ~75%.

Both run entirely in your browser (zero server cost). Homer also has a Python 
CLI for terminal use:
  $ pip install homer-cli
  $ git log | homer

Try it: https://dandanyoou.github.io/dancaveman/

Code:
- Web: https://github.com/dandanyoou/dancaveman
- Python CLI: https://github.com/dandanyoou/Homer

Quick benchmarks (Homer):
- Git Log: 70.3% reduction
- NPM Test: 71.7%
- JSON API: 93.9%
- Application Logs: 90.4%

Feedback welcome — especially edge cases where the filters fail.

Why I built this: I read about the original "caveman" speak skill and rtk on HN, 
and noticed they solve different problems (output style vs CLI noise). I wanted 
both as one workflow with a web UI for non-CLI users.

Limitations:
- Caveman uses rules, not an LLM. Quality varies.
- Homer's filters are best-effort. Open to PRs adding more formats.
- The Chrome extension auto-compresses ChatGPT/Claude inputs (Ctrl+Shift+C).
```

---

## 2. Reddit r/ClaudeCode

**제목:**
```
[Tool] Made Token Optimizer — compress prompts AND CLI outputs (better than rtk in my tests)
```

**본문:**
```
Saw the rtk thread last week and the original Caveman skill. Both solve token waste 
but in different ways. I combined them into one web app.

**🦣 Caveman** — Compresses your prompts before sending to Claude
- Strips "I think", "Let me explain", "I would recommend that you consider..."
- Removes articles, weak qualifiers, polite filler
- 3 levels: Lite, Full (recommended), Ultra (telegraph mode)
- Korean + English

**🍩 Homer** — Compresses CLI output before pasting to Claude Code
- 10 format detectors: git, test, JSON, logs, CSV, Docker, stack traces, ls, grep
- Average 81.6% reduction in my benchmarks
- rtk averages ~75% (their claim)
- Available as web tool AND `pip install homer-cli`

**Why both?**
- Caveman = what YOU type
- Homer = what TERMINAL outputs

Both eat your tokens.

**Quick test:**
1. Open https://dandanyoou.github.io/dancaveman/
2. Paste your last `git log -10` output → Homer tab → click compress
3. See if you get useful info in 1/10 the tokens

**Chrome extension** also available — auto-injects 🦣 button into ChatGPT/Claude:
- Ctrl+Shift+C in any input box → compressed in place
- https://github.com/dandanyoou/dancaveman/tree/main/chrome-extension

GitHub:
- Web: https://github.com/dandanyoou/dancaveman
- CLI: https://github.com/dandanyoou/Homer

Honest take: rtk is more robust for production CLI flows (Rust, faster). Homer 
is for quick experimentation and includes prompt compression in one place. PRs welcome.
```

---

## 3. Reddit r/LocalLLaMA / r/OpenAI

**제목:**
```
Browser tool to compress prompts before sending to GPT/Claude (saves ~70% tokens)
```

**본문:**
```
Built a free browser tool that compresses verbose prompts before sending to LLMs.

Two modes:
- 🦣 Prompt compression — strips fluff like "I would recommend that you consider..."
- 🍩 CLI output compression — git logs, test results, JSON to LLM-ready format

Average reduction: 70-95% depending on input.

No server, no API key, no signup. Runs in your browser.

https://dandanyoou.github.io/dancaveman/

Inspiration:
- Original Caveman skill (HN, last month)
- rtk Rust tool (HN, last month)

I noticed they solve different sides of token waste, so I made both into one 
web tool. Also Chrome extension that auto-compresses ChatGPT/Claude inputs.

Open to feedback. Especially curious about cases where compression breaks 
the response quality.
```

---

## 4. Twitter/X 스레드

**스레드 시작:**
```
🦣🍩 Built a free tool to fight LLM token waste

Two compressors in one browser:

1/ Caveman — compresses YOUR prompts
"I would recommend that you consider..." → ""
70% reduction average

https://dandanyoou.github.io/dancaveman/
```

**2/**
```
2/ Homer — compresses CLI OUTPUTS

git log → 1-line summary
npm test → only failures
JSON → schema + sample
logs → ERROR/WARN only

Avg 81% reduction (vs rtk's ~75%)
```

**3/**
```
3/ Why both?

🦣 = what YOU type
🍩 = what your TERMINAL outputs

Both burn through tokens fast.

Both run entirely in browser. Zero cost.
Also available as Chrome extension that auto-compresses ChatGPT/Claude inputs (Ctrl+Shift+C).
```

**4/**
```
4/ Try it now:

🌐 https://dandanyoou.github.io/dancaveman/

Test cases that work great:
- Long technical prompts
- git log -50
- npm test 2>&1
- curl -s api.json
- production app.log

Feedback welcome 🙏
```

---

## 5. Product Hunt

**Tagline:**
```
Compress your AI prompts and CLI outputs. Free, browser-based, no signup.
```

**Description:**
```
Two tools in one place to solve LLM token waste:

🦣 Caveman — Strips redundant words from prompts (Korean + English)
🍩 Homer — Compresses CLI outputs (git, npm, JSON, logs) for LLM consumption

Average 70-95% token reduction. Works in browser. Chrome extension also 
available for auto-compression in ChatGPT/Claude.

Built because rtk + caveman skill solved the same problem from different sides. 
This unifies both.

Free forever. MIT licensed. PRs welcome.
```

**First comment (founder):**
```
Hi PH! I'm the maker.

Quick story: I watched my Claude Code burn through $20 of API tokens reading a 
single git log. Then saw rtk on HN and the caveman skill. Both solved part of 
the problem but neither was the complete answer.

So I built both into one workflow:
- Web app for everyone
- Python CLI for terminal users (pip install homer-cli)
- Chrome extension for ChatGPT/Claude users

Honest about limits:
- Rules-based, not LLM-based (so it's free and instant)
- Aggressive Ultra mode might over-compress technical content
- Korean + English only (PRs welcome for more languages)

Would love feedback on edge cases where the compression breaks usefulness.
```

---

## 6. LinkedIn

```
Just shipped: Token Optimizer 🦣🍩

If you spend $$$$ on AI tokens, this is for you.

Two free tools in one browser:

1️⃣ Caveman — compresses your prompts
   • "Sure, I'd be happy to help" → removed
   • "I would recommend that you consider..." → ""
   • 70% reduction average

2️⃣ Homer — compresses CLI outputs before AI sees them
   • git log → 1-line summary (74% reduction)
   • npm test → only failures (72%)
   • JSON → structure + sample (94%)
   • logs → ERROR/WARN only (90%)

Why I built it:
- AI tools are expensive
- Most token waste is filler ("I think...", "Let me explain...")
- Existing tools (rtk, caveman skill) solved part of it

Now combined into one workflow:
🌐 Web: https://dandanyoou.github.io/dancaveman/
📦 CLI: pip install homer-cli
🔌 Chrome extension: ChatGPT/Claude auto-compression

Free. No signup. Open source.

Feedback appreciated 🙏

#AI #LLM #DeveloperTools #OpenSource
```

---

## 7. 한국 커뮤니티 (디스코드, OKKY, 클리앙 등)

```
[공유] AI 토큰 절약 도구 만들었어요 🦣🍩

ChatGPT, Claude 같은 AI 도구 쓰면서 토큰 빨리 닳는다고 느끼셨다면...

두 가지 도구를 한 사이트에 모았습니다:

🦣 Caveman: 긴 프롬프트 → 짧게 압축
   - "안녕하세요. 저는 지금 도움이 필요한데요..." → "도움 필요"
   - 평균 70% 절감
   - 한국어/영어 모두 지원
   - 3단계 강도 (Lite/Full/Ultra)

🍩 Homer: CLI 출력 → AI에 넣기 좋게 압축
   - git log, npm test, JSON, 로그 등을 자동 인식
   - 평균 81% 절감 (rtk보다 좋음)
   - 웹 + Python CLI 두 가지

🌐 사용해보기: https://dandanyoou.github.io/dancaveman/

특징:
- 무료, 회원가입 X, 서버 호출 X (브라우저에서만 동작)
- 오픈소스 (MIT)
- Chrome 확장도 있음 (ChatGPT/Claude 자동 압축, Ctrl+Shift+C)

피드백 환영합니다!
- 어떤 프롬프트에서 잘 동작 안 하는지
- 어떤 명령어 출력에서 더 좋은 압축이 필요한지

GitHub:
- 웹: https://github.com/dandanyoou/dancaveman
- CLI: https://github.com/dandanyoou/Homer
```

---

## 📅 게시 순서 추천

1. **Day 1**: 한국 커뮤니티 (피드백 빠르게 받기)
2. **Day 2-3**: 피드백 반영
3. **Day 4**: Reddit r/ClaudeCode (타겟 사용자)
4. **Day 5**: HN Show HN (피크 시간 화-목 PT 8-10am)
5. **Day 7**: Product Hunt (월요일 12:01 AM PT)
6. **Day 7+**: Twitter, LinkedIn

## 🎯 모니터링

- HN: https://news.ycombinator.com/show
- Reddit upvotes: 50+ 이상이면 성공
- GitHub stars: 일주일 내 100+ 목표
- 트래픽: GitHub Pages 통계 또는 Plausible 추가

## 🔥 후속 액션

100+ 사용자 도달 시:
1. PyPI 통계로 다운로드 수 확인
2. 가장 자주 실패하는 케이스 분석
3. v0.3 출시 (실측 데이터 기반 개선)
