# 🌍 FlagGenius — AI README

> **For AI assistants:** This document contains everything needed to understand, extend, and modify the FlagGenius project. Start here when context is limited.

---

## Project Summary

**FlagGenius** is a pixel-art styled, bilingual (English/Chinese) country flag quiz game built with React + TypeScript + Vite. Players test geography knowledge in two quiz modes. Every answer is automatically tracked to localStorage, powering a timed Study Mode where they can review countries they got right or wrong.

- **Stack:** React 19, TypeScript, Vite, Tailwind CSS (CDN), Lucide React icons
- **Fonts:** Press Start 2P (pixel titles), VT323 (pixel body text) via Google Fonts
- **Persistence:** `localStorage` via `storage.ts` — no backend, no API calls
- **Note:** `@google/genai` package is installed but unused — Gemini hook point is in `GameScreen.tsx` after `handleOptionClick`

---

## File Map

```
flag-genius/
├── index.html                # Entry HTML; loads Tailwind CDN, Google Fonts, importmap
├── index.tsx                 # React root mount
├── App.tsx                   # Root component: all top-level state + routing between screens
├── types.ts                  # All TypeScript types and enums
├── translations.ts           # i18n strings for 'en' and 'zh'
├── constants.ts              # COUNTRIES array (~150 countries) with emoji, names, fun facts
├── storage.ts                # localStorage helpers (wrong/right tracking + language preference)
├── vite.config.ts            # Vite config (port 3000, React plugin, GEMINI_API_KEY passthrough)
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── components/
    ├── GameScreen.tsx        # Quiz game logic and UI
    ├── StudyScreen.tsx       # Timed study/review mode UI
    └── Button.tsx            # Reusable pixel-art styled button
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

enum StudyType {
  WRONG = "WRONG", // Study countries answered incorrectly in past games
  RIGHT = "RIGHT", // Study countries answered correctly in past games
}

enum GameState {
  MENU = "MENU", // Main menu
  PLAYING = "PLAYING", // Active quiz game
  STUDY_SELECT = "STUDY_SELECT", // Study mode type picker
  STUDYING = "STUDYING", // Active study session
}

interface Question {
  target: Country; // Correct answer
  options: Country[]; // 5 shuffled options (includes target)
}
```

---

## localStorage (`storage.ts`)

Persists study history and user preferences across sessions. All keys are centralized in the internal `KEYS` constant.

```typescript
// Keys used:
//   'flaggenius_wrong' → JSON array of country codes answered wrong
//   'flaggenius_right' → JSON array of country codes answered right
//   'flaggenius_lang'  → 'en' | 'zh' language preference

getWrongCodes(): string[]       // Returns full array
getRightCodes(): string[]       // Returns full array
addWrongCode(code: string)      // Adds to wrong set (deduped via Set)
addRightCode(code: string)      // Adds to right set (deduped via Set)
getWrongCount(): number         // Length of wrong set
getRightCount(): number         // Length of right set
clearWrongCodes(): void         // Removes 'flaggenius_wrong' key entirely
clearRightCodes(): void         // Removes 'flaggenius_right' key entirely
```

Language preference is managed directly in `App.tsx` using `localStorage.getItem/setItem('flaggenius_lang')` — not via a dedicated helper, since it's a single scalar value rather than a set.

**Important:** Both code sets use a `Set` internally so a code is never duplicated. Both lists grow independently — a country can appear in both (right once, wrong another time).

---

## App-level State & Routing (`App.tsx`)

```typescript
gameState: GameState           // Controls which screen is shown
gameMode: GameMode             // Passed to GameScreen
studyType: StudyType           // Passed to StudyScreen
language: Language             // 'en' | 'zh', passed to all children
confirmClear: StudyType | null // null = no modal; set to open clear-confirmation modal
counts: { wrong: number, right: number } // Local copy of localStorage counts for instant UI updates
```

**Screen routing logic:**

- `MENU` → main menu with 3 cards (Flag→Country, Country→Flag, Study Mode)
- `PLAYING` → `<GameScreen mode={gameMode} />`
- `STUDY_SELECT` → study type picker (Review Wrong / Review Right)
- `STUDYING` → `<StudyScreen studyType={studyType} />`

**Language persistence:** `language` state is initialized via a lazy `useState` initializer that reads `localStorage.getItem('flaggenius_lang')`, falling back to `'en'`. `toggleLanguage()` writes the new value to localStorage before updating state. Wrapped in `try/catch` for private-browsing safety.

**Study Mode card on the menu** shows live wrong/right counts from `counts.wrong` / `counts.right`. `refreshCounts()` is called whenever navigating to or back from `STUDY_SELECT`.

**STUDY_SELECT screen:** Each card (Review Wrong / Review Right) has a `Trash2` icon button in its top-right corner, only shown when `counts.wrong > 0` / `counts.right > 0`. Clicking opens the confirmation modal by setting `confirmClear` to the appropriate `StudyType`. `handleClear(type)` calls `clearWrongCodes()` or `clearRightCodes()`, refreshes `counts`, then sets `confirmClear` back to `null`.

**Confirmation modal:** Fixed overlay rendered at the root level when `confirmClear !== null`. Clicking the backdrop cancels. Styled red or green depending on which list is being cleared. Cancel sets `confirmClear` to `null`; "Yes, Clear" calls `handleClear`.

**Language toggle button** has `whitespace-nowrap` to prevent "中文" from wrapping to two lines on mobile.

---

## Component Architecture

### `GameScreen.tsx`

- **Props:** `mode: GameMode`, `language: Language`, `onBack: () => void`
- **State:** `currentQuestionIndex`, `score`, `question`, `selectedOption`, `isCorrect`, `funFactIndex`, `isGameOver`
- **Key constant:** `QUESTIONS_PER_ROUND = 10`
- **Question generation:** `generateQuestion()` — random target + 4 distractors, shuffled. `useCallback` with empty deps (safe — `COUNTRIES` is module-level).
- **localStorage tracking:** Every answer auto-calls `addRightCode` (correct) or `addWrongCode` (wrong), so Review Right / Review Wrong lists fill up passively as the user plays. No manual action required.
- **Flow:** answer → feedback + fun fact → Next → repeat → Game Over

### `StudyScreen.tsx`

- **Props:** `studyType: StudyType`, `language: Language`, `onBack: () => void`
- **State:** `questions`, `isEmpty`, `currentIndex`, `selectedOption`, `result`, `timeLeft`, `isStudyOver`, `correctCount`, `totalTime`, `resetKey`
- **Refs:** `startTimeRef` (session start ms), `currentIndexRef` + `questionsRef` + `advanceRef` (avoid stale closures in timer callbacks)
- **Session init:** `useEffect` on `[studyType, resetKey]` — loads codes from localStorage, filters `COUNTRIES`, shuffles, builds 5-option questions, resets all state.
- **Timer:** decrements `timeLeft` by 0.1 every 100ms via `setTimeout` while `result === null`. Stops on answer or expiry.
- **Result values:** `'correct'` | `'wrong'` | `'timeout'` | `null`
- **Auto-advance delays:** correct = 400ms, wrong/timeout = 1500ms
- **Timer bar color:** green > 6s, yellow > 3s, red ≤ 3s
- **Total time:** `Math.round((Date.now() - startTimeRef.current) / 1000)` set when last question is exhausted
- **"Study Again":** increments `resetKey` to retrigger the init `useEffect`
- **Empty state:** shown when localStorage has no codes for the chosen `studyType`
- **Always uses FLAG_TO_COUNTRY layout** (shows flag emoji → pick country name from 5 text buttons)

### `Button.tsx`

- Variants: `primary` (blue), `secondary` (tan), `outline`, `danger` (red), `success` (green), `ghost`
- Pixel-art shadow via `box-shadow`; active state: `translate-y-1 translate-x-1`

---

## Styling Conventions

- **Color palette (Stardew Valley / retro pixel theme):**
  - Background: `#2a233e` (dark purple)
  - Header/feedback bg: `#3e2723` (dark brown)
  - Cards: `#e6ccb2` / `#d2b48c` (tan/wood)
  - Accent blue: `#4a90e2`
  - Accent green: `#76c442`
  - Danger red: `#e25c5c`
  - Study purple: `#b39ddb` / `#7c6a9e`
  - Review wrong: `#e25c5c` border on `#3e2723` bg
  - Review right: `#76c442` border on `#1b3a1f` bg
  - Text dark: `#2c1b18`, `#5c4033`
  - Text light: `#d2b48c`, `#f5f5f5`
- **Borders:** `border-4` with matching darker shade, `shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]` for depth
- **Fonts:** `.font-pixel-title` = Press Start 2P, `font-['VT323']` = VT323
- **Emoji rendering:** class `emoji-flag` forces system emoji fonts

---

## i18n System (`translations.ts`)

All UI strings live in `Translations[language]`. Usage:

```typescript
const t = Translations[language];
// t.correct, t.score, t.studyComplete, etc.
```

Key translation keys added for Study Mode:

```
studyMode, studyModeDesc, studyBadge
studySelectTitle, studySelectDesc
reviewWrong, reviewWrongDesc, reviewRight, reviewRightDesc
countries, noWrongItems, noRightItems, noStudyItemsDesc
timeUp, studyComplete, totalTime, correctAnswers, missedAnswers, accuracy
studyAgain, backToStudy, movingOn, nextIn, nextNow, clearRecords, confirmClearWrong, confirmClearRight, confirmClearDesc, confirmYes, confirmNo
```

Country names come from the `Country` object: `country.name` (EN) or `country.nameZh` (ZH).

---

## Data (`constants.ts`)

- ~150 countries as `COUNTRIES: Country[]`
- Each entry: `code`, `name`, `nameZh`, `emoji`, `funFacts[3]`, `funFactsZh[3]`

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

Add an entry to `COUNTRIES` in `constants.ts` following the existing format.

### Add a new study mode type

1. Add value to `StudyType` in `types.ts`
2. Add storage helpers in `storage.ts`
3. Add a card in the `STUDY_SELECT` screen in `App.tsx`
4. Handle the new type in `StudyScreen.tsx`'s session init `useEffect`

### Change questions per round (quiz)

Edit `QUESTIONS_PER_ROUND = 10` in `GameScreen.tsx`.

### Change study timer duration

Edit `STUDY_TIME_LIMIT = 10` in `StudyScreen.tsx`.

### Change auto-advance delays in study mode

In `StudyScreen.tsx`, find the `useEffect` on `[result]`:

```typescript
const delay = result === "correct" ? 400 : 1500;
```

### Add a new language

1. Add the code to `type Language` in `types.ts`
2. Add a full translation object to `translations.ts`
3. Update the toggle button in `App.tsx`
4. Add `nameXx` and `funFactsXx` fields to `Country` interface and all entries in `constants.ts`

### Clear study history

Trash buttons are built into the Study Select screen — no manual localStorage manipulation needed. To clear programmatically: call `clearWrongCodes()` / `clearRightCodes()` from `storage.ts`.

### Add AI-powered hints (Gemini API ready)

`@google/genai` is installed; `GEMINI_API_KEY` flows from `.env` → `vite.config.ts` → `process.env.GEMINI_API_KEY`. Best hook point: inside `GameScreen.tsx` after `handleOptionClick`, or as a pre-answer hint button.

---

## Dev Setup

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run preview
```

---

## Known Patterns / Gotchas

- **`funFactIndex` stores a number, not the string** — avoids re-picking on language switch; text derived at render via `getFunFactText()`
- **`StudyScreen` uses refs to avoid stale closures** — `currentIndexRef`, `questionsRef`, `advanceRef` kept in sync so `setTimeout` callbacks always see current values
- **`resetKey` pattern** — incrementing a dummy state to retrigger a `useEffect` is intentional; cleanest way to restart a session without unmounting
- **Both wrong AND right lists can contain the same code** — by design; lists track all-time history, not mutually exclusive state
- **Tailwind via CDN** — arbitrary values like `shadow-[8px_8px_0px...]` work because the CDN version uses JIT. No PostCSS needed
- **`emoji-flag` class** in `index.html` forces system emoji fonts for correct flag rendering across platforms
- **`whitespace-nowrap` on language toggle** — prevents "中文" wrapping to two lines on narrow mobile viewports
- **Language preference in localStorage** — initialized via lazy `useState(() => localStorage.getItem(...))` so it reads once on mount, never on re-renders. `toggleLanguage` writes before setting state so the value is always committed even if the component unmounts immediately
