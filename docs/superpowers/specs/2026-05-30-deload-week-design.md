# Deload Week — Design Spec

**Date:** 2026-05-30
**Status:** Approved

## Overview

A manual deload mode that reduces workout volume across the entire week to aid recovery. Intended to be used every 6–8 weeks as needed.

## Data & State

A single boolean flag stored in `localStorage` under the key `deload_active`. Read at app startup and mirrored into the global `state` object.

```js
// Read on startup
state.deloadActive = localStorage.getItem('deload_active') === 'true';

// Toggle
function setDeload(on) {
  state.deloadActive = on;
  localStorage.setItem('deload_active', on ? 'true' : 'false');
}
```

No changes to `TEMPLATES`. Deload is applied at render time only.

## Home Screen UI

**When deload is active:** An amber banner renders below the header:

```
Deload Week Active   [Turn Off]
```

**When deload is inactive:** A small "Start Deload Week" text link at the bottom of the home screen. Low-prominence — accessible but not in the way.

The same active banner appears on the pre-workout screen and the active workout screen so the user always knows deload mode is on during a session.

## Rendering Logic

Applied inside the exercise rendering functions wherever set counts are output. Weight and rest times are not modified.

| Exercise type | Normal sets | Deload sets |
|---|---|---|
| Plyo (`isPlyo: true`) | N | 1 |
| All others | N | `Math.ceil(N / 2)` |

Examples:
- 4 sets → 2 sets
- 3 sets → 2 sets
- 1 set → 1 set
- Plyo 4 sets → 1 set

## Out of Scope

- Automatic triggering based on session count or calendar
- Per-exercise `deloadSets` overrides
- Weight reduction (volume reduction is the primary recovery lever)
- EMOM/AMRAP modifications (deload applies to straight sets only)
