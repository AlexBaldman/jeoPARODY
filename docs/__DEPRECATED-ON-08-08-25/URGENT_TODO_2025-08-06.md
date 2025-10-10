# 🚨 Urgent To-Do List – Visual & Functional Bugs (2025-08-06)

> Source: User QA session & latest screenshot

## 1. Ticker Plane System
- Transparent red box visible – remove.
- Plane currently flipped (flies backward) – correct orientation.
- Towed banner: red, semi-transparent, fluttering flag; holds ticker text.
- Random flight heights (20-80% viewport).
- Trigger flights on game events: correct/incorrect answer, streak start/end, etc.
- Smooth continuous motion; no abrupt start/stop.
- Ensure plane + banner render **behind** speech bubble, host, scoreboard, etc. (`z-index: var(--z-plane)`).

## 2. Host Image
- Cropped/strangely sized – adjust clipping & container size.
- Hover causes glitchy duplicate image – fix hover handler & transform origin.
- Add small left/right arrows on edges to cycle host images during dev.

## 3. Answer Reveal Box
- Invisible answer (opacity 0) – set proper opacity.
- Transparent green border appears – remove unwanted styling.

## 4. Speech / Question Bubble
- Text too small – scale with `--fs-question`.
- Extra `$` still showing in dollar amounts.
- Arrow mis-positioned: should be ~20–25% from left, shaped like `|/`, below bubble.
- Bubble themes: enable cycling via tapping left/right edges.
- Need to make sure we are removing escape characters (for example an answer recently read "Grant\'s ants" so the backslash should be removed)

## 5. Scoreboard
- Still over sticky header; theme unreadable.
- Should peek behind footer; hover/tap to slide down; auto-slide on score change with count animation.

## 6. Buttons & Controls
- Buttons need tooltips: New Question, Show/Hide Answer, Submit.
- Submit click / `Enter` key not wiring to handler → answers never submitted.
- Translate toggle non-functional.
- Light/Dark switch animates but doesn’t change theme.
- Hamburger icon does not open side menu.

## 7. Profile Component
- Ugly styling; overlaps sticky header; fix position and theme.

## 8. Title / Branding
- Title image missing in header; text still “Jeopardish!” – replace with `jeoPARODY!` branding.

## 9. Console & Build Errors
- 500 error loading `/main.js` – investigate server route / Vite error.
- Firebase config placeholder log – ensure prod config loaded.
- Font decode failure (OTS) – re-encode or swap font.
- Vite esbuild error at `src/main.js:440` (unexpected EOF) – fix syntax.

---
**Next Steps**
1. Triage: group issues by component & severity.
2. Fix build/runtime errors first (main.js, font, Vite).
3. Address high-impact UI bugs (answer invisible, $ duplication, title branding).
4. Iterate on medium-priority polish (plane ticker, tooltips, host image).
