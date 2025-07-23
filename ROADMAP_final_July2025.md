# 📍 PromptSensei — ROADMAP.md (Final — July 2025)

## 🟢 CURRENT VERSION: `v2.4-free-beta`

✅ Implemented:
- Full UI wizard with 9 steps (restored after rollback)
- Language support: auto-detect + manual
- Polish / Deep Insight / Format / Tone / Audience steps working
- Multilingual support (EN, RU, ES, etc.)
- Model switching (GPT, Claude, Gemini) via redirect buttons

⚠ Requires attention:
- ResultScreen prompt output sometimes incorrect (was fixed via rollback)
- UX flow too long — compressed version under development

---

## 🧪 NEXT VERSION: `v2.5` (Release Candidate)

🎯 Goal: Refactor UX to 5-step flow while preserving all functionality

### ✅ Final 5-Step UX Flow:

| Step | Title | Functionality |
|------|-------|---------------|
| 1 | What do you want to ask the AI? | Input + silent Polish |
| 2 | Who is the answer for? | Myself / Client / Manager / etc. |
| 3 | What tone do you prefer? | Friendly / Expert / etc. |
| 4 | What format would be best? | Bullet / Paragraph / Step |
| 5 | Would you like the AI to go deeper? | Deep Search / Just Smarter / Keep it Simple |

📌 Note:
- `Polish` is always enabled silently — no toggle.
- Step 5 replaces Deep Search, Deep Insight, Polish, and Make it Smarter.
- Tooltips, hints, banners from removed steps must be reassigned.

---

## 🛠 TASK FOR LOVABLE

1. Refactor UI steps to 5-step structure as above.
2. Remove steps: autoEnhance, depth, polish, optimize — after migrating logic.
3. Migrate tooltips/banners from deleted steps to relevant new ones.
4. Preserve localization and language-switching behavior.
5. `generationMode` must store: `'deep_search' | 'optimize' | 'simple'`.

---

## 🟠 SHORT-TERM GOALS (Q3 2025)

- ✅ Polish UX copy, tooltips (more beginner-friendly)
- 🧪 A/B Testing for flow performance
- 🕓 Prompt timing analytics (time-on-step, conversion rate)
- 🗂 LocalStorage-based prompt history (basic tracking)

---

## 💰 PREMIUM & PRO VERSIONS (MONETIZATION STRATEGY)

**Premium Plan**
- Unlimited prompt enhancement
- Custom styles & tones
- Prompt version history (local)
- Save prompt as template
- Generate multiple AI prompt variants

**Pro Plan**
- Team prompt library
- A/B testing support
- Version control (per prompt)
- Integration with external LLMs (via keys)
- Workspace access + analytics

💡 First launch with “Free + Premium” — add “Pro” tier once analytics available.

---

## 🔮 FUTURE ROADMAP (Q4 2025+)

- Prompt versioning (with revert)
- Prompt collaboration / sharing
- Multi-modal prompts (vision/audio/text)
- AI prompt grader / scoring system
- Browser extension (Chrome, Firefox)
- Mobile version (iOS / Android)

---

## 📊 USER FEEDBACK INSIGHTS

✅ Already covered:
- Prompt optimization (Polish it, etc.)
- Time-saving UX (from 9 to 5 steps)
- Style & tone variety
- Output format control (list, step, paragraph)
- Language support (9+ languages)

⚠ Needs improvement:
- Merge and simplify Deep Search vs Insight logic
- Unified toggle for auto-enhancement
- Mark languages as Beta (except English)

📈 Suggested in future:
- PromptHub-style history
- PromptLayer-like analytics
- Multi-user collaboration & templating