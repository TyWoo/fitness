# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-file mobile-first workout tracker PWA. The entire app — HTML, CSS, and JavaScript — lives in `index.html`. No build system, no dependencies, no package manager. Open the file directly in a browser to run it.

## Architecture

The app is structured as follows within `index.html`:

1. **CSS** — Design tokens via CSS custom properties (`:root`), then component styles organized by screen
2. **HTML** — Screen divs (`.screen`) that are shown/hidden via the `active` class
3. **JavaScript** — Data, state, and all logic at the bottom of the file

### Screens

Navigation is handled by `showScreen(name)` which toggles the `active` class on `.screen` elements. Screen names: `home`, `pre` (pre-workout), `workout`, `summary`, `history`.

### Data Model

- **`TEMPLATES`** — Hardcoded array of workout definitions. Each template has a `day` (0-6, JS day of week), `exercises`, and optionally `emom` or `amrap` objects for special timer workouts.
- **`state`** — Global mutable object holding active workout session data (active template, timer references, set data, EMOM/AMRAP state).
- **`localStorage`** — Workout history persisted under the key `workout_history` as a JSON array. Accessed via `getHistory()` / `saveHistory()`.

### Exercise Properties

Each exercise in a template can have:
- `superset: 'A'/'B'/...` — groups exercises into supersets (rendered together with a label)
- `isPlyo: true` — plyometric exercise
- `isHold: true` — timed hold (not weight-based)
- `isLight: true` — on the workout template (e.g., Basketball Day)
- `isRest: true` — on the template itself (rest day, no exercises)
- `isFlexible: true` — makeup/alternate workout, shown separately on home screen with `day: -1`

### Special Workout Modes

- **EMOM** — configured on a template via `emom: { duration, weekA, weekB }` (alternates weeks A/B based on workout history count)
- **AMRAP** — configured via `amrap: { duration, exercises }`

### Set Logging

Set data is keyed as `exerciseId_setIndex` in `state.setData`. Each entry stores `{ weight, reps, logged }`. Previous session data is pulled from `getLastSession(templateId)` and shown as reference in set rows.

## Files

- `index.html` — the workout tracker (single-file app, all HTML/CSS/JS)
- `dashboard.html` — analytics dashboard (React 18 + Chart.js 4 + Supabase, no build step)

## Development

Open either file in a browser — no server required. For mobile testing, serve locally:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080` on device or in browser DevTools mobile view.

## Dashboard Architecture (`dashboard.html`)

**Tech stack:** React 18 (Babel standalone UMD), Chart.js 4, Supabase JS v2, Tailwind Play CDN. No build step — open directly in browser.

**Screens (5-tab bottom nav):** Overview · Strength · Body · Cardio · History

**Data flow:** Fetches from two Supabase tables on mount — `workout_sessions` (300 rows) and `body_measurements` (100 rows). All processing is client-side via `useMemo`.

**Key data utilities:**
- `parseExercises(raw)` — normalises exercises JSONB to `[{id, name, sets}]`; filters unlogged sets
- `estimateE1RM(weight, repsRaw)` — Epley formula; `repsRaw` is a string, always `parseInt()`
- `getMuscleGroup(id)` — maps exercise IDs to muscle groups via `MUSCLE_MAP`
- `getLiftHistory(sessions, aliases, isPullup)` — extracts best estimated 1RM per session for a lift; pull-ups use `220 + (added_weight || 0)`
- `getSurfData(sessions, 21)` — per-day `{sets, readiness}` for the "Surf the Curve" hero chart
- `getWeekBounds(offsetWeeks)` — Mon–Sun week bounds for current/prior week stats

**"Surf the Curve" chart:** Mixed Chart.js chart (bar = daily sets on left y-axis, line = readiness on right y-axis, gaps spanned). Designed to accept HRV/RHR overlay datasets when Eight Sleep/Ultrahuman/Polar H10 are wired via n8n.

**Cardio screen:** Placeholder scaffolding for Polar H10 (HR/HRV), running app (pace, distance, HR zones), and Concept2 ErgData (split, SPM, HR). Existing `row_z2` sessions from `workout_sessions` surface immediately under the rowing section.

**Supabase sync (`index.html`):** `syncSessionToSupabase(session)` (called after `finishWorkout()`) POSTs to `workout_sessions` using native `fetch` with the publishable key. Maps camelCase local session object to snake_case column names.

## Key Conventions

- All rendering is done via `innerHTML` string concatenation (no framework/templating).
- Readiness score (0-100) from the pre-workout slider affects UI messaging only — it does not programmatically reduce sets.
- The weekly schedule assumes Mon=1 through Sun=0 (JS `Date.getDay()`), rendered in order `[1,2,3,4,5,6,0]`.
- Rest timer auto-starts when a set is logged (`logSet()`), and shows as a slide-up bar at the bottom of the screen.
