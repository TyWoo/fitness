# Program Iteration Design

**Date:** 2026-05-03
**Status:** Approved

## Background

10-week analysis (Feb 22 – Apr 29) showed two key issues:

1. **Squat stagnation** — only +10 lbs in 10 weeks. Cause: 4x5 every session with no volume variation leaves insufficient hypertrophy stimulus and limited room to progress.
2. **Rest timer UX bug** — the slide-up timer bar blocks set input fields at the bottom of the screen.

User goals: hypertrophy + athletic performance (basketball, explosiveness). Not primarily strength-focused. Phase 1 of program evolution addresses these. Phase 2 (full split restructure) follows after one cycle.

## Feature 1: Undulating Periodization (Week A / Week B)

### Overview

Main lifts alternate between a **strength week (A)** and a **volume week (B)**, determined automatically from workout history — the same mechanism already used by the EMOM (`weekA`/`weekB`). All accessories and plyos stay unchanged.

### Week definitions

| Lift | Week A (Strength) | Week B (Volume) |
|------|-------------------|-----------------|
| Bench Press | 4x5 @ 165 lbs | 4x8 @ 145 lbs |
| Back Squat | 4x5 @ 215 lbs | 4x8 @ 185 lbs |
| Barbell Row | 4x6 @ 155 lbs | 4x10 @ 135 lbs |
| Pull-ups | 3 sets, max reps | 3 sets, max reps (same both weeks) |

Pull-ups are identical both weeks — the goal is to build training data, not vary the protocol yet.

### Template changes

Exercises that have week A/B variation gain `weekA` and `weekB` objects instead of flat `startWeight`/`reps`:

```js
{
  id: 'bench',
  name: 'Barbell Bench Press',
  sets: 4,
  weekA: { reps: '5', startWeight: 165, notes: 'RPE 7-8. Strength week.' },
  weekB: { reps: '8', startWeight: 145, notes: 'Controlled tempo. Volume week.' },
  unit: 'lbs',
  rest: 150,
}
```

Exercises without week variation keep their existing flat structure unchanged.

### Week A/B determination

Reuse the existing `isWeekA(templateId)` logic (already used for EMOM). No new state needed.

A helper `getExerciseTargets(ex)` returns `{ reps, startWeight, notes }` for the current week — used everywhere `ex.reps` / `ex.startWeight` is read in the render path.

### UI changes

**Home screen:** A small **"Week A"** or **"Week B"** badge appears next to the workout card header. Color: `--accent` for A, `--purple` for B.

**Pre-workout screen:** The exercise list shows the correct week's targets (weight + reps). A one-line label — "Strength week" or "Volume week" — appears at the top.

**Workout screen:** Set rows pre-fill from the current week's `startWeight`. The previous session reference shows the matching week's last performance (week A compares to last week A, week B to last week B).

**Smart progression:** `getIncrement()` is applied per-week independently. Bench A progresses separately from Bench B.

### Saturday: Leg Press swap on volume weeks

On Week B (volume week), the Saturday Lower Hyp template swaps Front Squat 4x8 for Leg Press 4x12. This reduces CNS load alongside the plyometric block while maintaining quad hypertrophy volume. The app renders the correct exercise based on current week.

### Basketball day (Thu)

Add a simple post-session check-in to the Basketball Day template: a readiness/soreness slider (1-5) that saves to history. No sets/reps to log — just the check-in and duration. This populates the dashboard's "Cardio / Activity" tab with basketball session data.

## Feature 2: Rest Timer Collapsible Pill

### Problem

The rest timer `#rest-bar` slides up from the bottom as a fixed overlay. When the active set's weight/reps inputs are near the bottom of the screen, the bar covers them. On mobile, the keyboard compounds this.

### Solution

Convert the timer to a **collapsible pill**:

- **Collapsed state (default when timer starts):** A compact bar (~48px tall) fixed at the bottom showing only the countdown number and a small chevron. Does not obscure inputs.
- **Expanded state:** Tapping the pill expands it to the current full-height bar with the exercise name, countdown ring, and skip button.
- **Auto-collapse:** Timer starts in collapsed state. Expands only if user taps it.
- **Auto-dismiss:** When timer reaches 0, it plays the existing sound and collapses (does not expand).

The existing `#rest-bar` element gets a `collapsed` class toggled by a tap handler. CSS handles the height transition.

### CSS changes

```css
#rest-bar {
  /* existing styles */
  transition: height 0.25s ease, padding 0.25s ease;
}
#rest-bar.collapsed {
  height: 48px;
  padding: 0 16px;
  overflow: hidden;
}
#rest-bar.collapsed .rest-details { display: none; }
#rest-bar:not(.collapsed) .rest-pill-hint { display: none; }
```

The collapsed view shows: `[chevron up] 0:45 [tap to expand]` — minimal but functional.

### Padding adjustment

When the timer is active (collapsed), the workout screen bottom padding increases by 48px to prevent the pill from covering the last set row. Padding resets when timer dismisses.

## Out of Scope (Phase 2)

- Full split restructure (Mon → Upper Hyp, dedicated upper hyp volume day)
- Polar HRV integration into week A/B determination
- Dashboard strength trend charts per-week

## Files Affected

- `index.html` — all changes (templates, render functions, timer CSS/JS)
