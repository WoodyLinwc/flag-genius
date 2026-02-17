# 🌍 FlagGenius — AI README

> **For AI assistants:** This document contains everything needed to understand, extend, and modify the FlagGenius project. Start here when context is limited.

---

## Project Summary

**FlagGenius** is a pixel-art styled, bilingual (English/Chinese) country flag quiz game built with React + TypeScript + Vite. Players can test geography knowledge in two modes, with fun facts revealed after each answer.

- **Stack:** React 19, TypeScript, Vite, Tailwind CSS (CDN), Lucide React icons
- **Fonts:** Press Start 2P (pixel titles), VT323 (pixel body text) via Google Fonts
- **No backend.** All data is static. No API calls (the `@google/genai` package is installed but unused in current code).

---

## File Map

```
flag-genius/
├── index.html           # Entry HTML; loads Tailwind CDN, Google Fonts, importmap
├── index.tsx            # React root mount
├── App.tsx              # Root component: handles menu/game state, language toggle
├── types.ts             # TypeScript types: Country, GameMode, GameState, Question, Language
├── translations.ts      # i18n strings for 'en' and 'zh'
├── constants.ts         # COUNTRIES array (~150 countries) with emoji, names, fun facts
├── vite.config.ts       # Vite config (port 3000, React plugin, GEMINI_API_KEY passthrough)
├── tsconfig.json        # TypeScript config
├── package.json         # Dependencies
└── components/
    ├── GameScreen.tsx   # Core game logic and UI
    └── Button.tsx       # Reusable pixel-art styled button
```

---

## Core Data Types (`types.ts`)

```typescript
type Language = "en" | "zh";

interface Country {
  code: string; // ISO 3166-1 alpha-2, e.g. 'JP'
  name: string; // English name
  nameZh: string; // Chinese name
  emoji: string; // Flag emoji, e.g. '🇯🇵'
  funFacts: string[]; // 3 English fun facts
  funFactsZh: string[]; // 3 Chinese fun facts
}

enum GameMode {
  FLAG_TO_COUNTRY = "FLAG_TO_COUNTRY", // Show flag → pick country name
  COUNTRY_TO_FLAG = "COUNTRY_TO_FLAG", // Show country name → pick flag emoji
}

enum GameState {
  MENU,
  PLAYING,
}

interface Question {
  target: Country; // Correct answer
  options: Country[]; // 5 options (includes target, shuffled)
}
```

---

## Component Architecture

### `App.tsx`

- Manages top-level state: `gameState`, `gameMode`, `language`
- Renders the main menu (two mode cards) or `<GameScreen />`
- Contains the language toggle button (EN ↔ 中文)
- Injects global CSS animations (`fadeIn`, `fadeInUp`, `slideUp`)

### `GameScreen.tsx`

- **Props:** `mode: GameMode`, `language: Language`, `onBack: () => void`
- **State:** `currentQuestionIndex`, `score`, `question`, `selectedOption`, `isCorrect`, `funFactIndex`, `isGameOver`
- **Key constant:** `QUESTIONS_PER_ROUND = 10`
- **Question generation:** `generateQuestion()` — picks random target + 4 distractors from `COUNTRIES`, shuffles all 5
- **Flow:** answer → show feedback + fun fact → Next button → repeat → Game Over screen
- Handles both game modes by switching between showing emoji (FLAG_TO_COUNTRY) or country name (COUNTRY_TO_FLAG) as the prompt, and the inverse as option labels

### `Button.tsx`

- Variants: `primary` (blue), `secondary` (tan), `outline`, `danger` (red), `success` (green), `ghost`
- Pixel-art shadow via `box-shadow`
- Active state: `translate-y-1 translate-x-1` for press effect

---

## Styling Conventions

- **Color palette (Stardew Valley / retro pixel theme):**
  - Background: `#2a233e` (dark purple)
  - Header: `#3e2723` (dark brown)
  - Cards: `#e6ccb2` / `#d2b48c` (tan/wood)
  - Accent blue: `#4a90e2`
  - Accent green: `#76c442`
  - Danger red: `#e25c5c`
  - Text dark: `#2c1b18`, `#5c4033`
  - Text light: `#d2b48c`, `#f5f5f5`
- **Borders:** `border-4` with matching darker color, `shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]` for depth
- **Fonts:** `.font-pixel-title` = Press Start 2P, `font-['VT323']` = VT323
- **Emoji rendering:** class `emoji-flag` forces system emoji fonts

---

## i18n System (`translations.ts`)

All UI strings are in `Translations[language]` where `language` is `'en'` or `'zh'`. Usage:

```typescript
const t = Translations[language];
// then use t.correct, t.score, t.next, etc.
```

Country names are on the `Country` object: `country.name` (EN) or `country.nameZh` (ZH).

---

## Data (`constants.ts`)

- ~150 countries as `COUNTRIES: Country[]`
- Each entry has: `code`, `name`, `nameZh`, `emoji`, `funFacts` (3 items), `funFactsZh` (3 items)
- Example:

```typescript
{
  code: 'JP', name: 'Japan', nameZh: '日本', emoji: '🇯🇵',
  funFacts: ["Has highest life expectancy.", "Vending machines everywhere.", "Square watermelons exist."],
  funFactsZh: ["人均寿命最高。", "自动售货机随处可见。", "有方形西瓜。"]
}
```

---

## Common Extension Tasks

### Add a new country

Add an entry to the `COUNTRIES` array in `constants.ts` following the existing format.

### Add a new game mode

1. Add value to `GameMode` enum in `types.ts`
2. Add a menu card in `App.tsx`
3. Handle the new mode logic in `GameScreen.tsx`

### Add a new language

1. Add the language code to `type Language` in `types.ts`
2. Add a translation object to `translations.ts`
3. Update the toggle button in `App.tsx`
4. Add `nameXx` and `funFactsXx` fields to the `Country` interface and `constants.ts`

### Change questions per round

Edit `QUESTIONS_PER_ROUND = 10` in `GameScreen.tsx`.

### Add AI-powered hints (Gemini API ready)

The `@google/genai` package is installed and `GEMINI_API_KEY` is passed through via `vite.config.ts` from a `.env` file (`GEMINI_API_KEY=...`). No AI calls are currently implemented — the hook point would be inside `GameScreen.tsx` after `handleOptionClick`.

---

## Known Patterns / Gotchas

- `generateQuestion` is wrapped in `useCallback` with empty deps — safe because `COUNTRIES` is a module-level constant
- `funFactIndex` is stored as a number (not the string) to avoid re-picking on language switch; the actual text is derived at render time via `getFunFactText()`
- Tailwind is loaded via CDN in `index.html`, **not** as a PostCSS plugin — arbitrary values like `shadow-[8px_8px_0px...]` work because of JIT in the CDN version
- The `emoji-flag` CSS class in `index.html` forces correct emoji font rendering across platforms
