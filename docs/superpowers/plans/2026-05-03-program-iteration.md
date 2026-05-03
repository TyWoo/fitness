# Program Iteration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add undulating periodization (Week A/B alternation) to main lifts and fix the rest timer blocking inputs on mobile.

**Architecture:** All changes are in `index.html` (single-file app). Two independent features: (1) a `getEffectiveExercise(ex)` helper resolves the week-appropriate exercise properties at render time, touching templates, `renderExerciseInner`, and `renderHome`; (2) the rest bar gets a collapsed pill state that starts by default and expands on tap, preventing input occlusion.

**Tech Stack:** Vanilla JS, HTML/CSS in `index.html`. No build step. Test by opening in browser (mobile DevTools or real device).

---

## File Map

- **Modify:** `index.html` — all changes live here
  - CSS block (~line 197): rest-bar styles
  - HTML rest-bar (~line 395): restructure for collapsed/expanded states
  - TEMPLATES (~lines 506–651): add `weekA`/`weekB` to bench, squat, row, pullup, front_squat
  - Near `getWeekNumber` (~line 1543): add `isCurrentWeekA()` and `getEffectiveExercise()`
  - `renderHome` (~line 860): add Week A/B badge to workout cards
  - `selectWorkout` (~line 922): show week label on pre-workout screen
  - `renderExerciseInner` (~line 1005): use `getEffectiveExercise()` for targets
  - `startRestTimer` (~line 1108): start in collapsed state, manage screen padding
  - `updateRestDisplay` (~line 1126): update pill countdown
  - `skipRest` (~line 1140): clear collapsed class and padding

---

## Task 1: Add `isCurrentWeekA()` and `getEffectiveExercise()` helpers

**Files:**
- Modify: `index.html` — insert after `getWeekNumber()` at ~line 1547

- [ ] **Step 1: Insert the two helper functions after `getWeekNumber()`**

  Find the closing brace of `getWeekNumber()` at ~line 1547 and insert immediately after:

  ```js
  function isCurrentWeekA() {
    return getWeekNumber() % 2 === 1;
  }

  // Returns the effective exercise for the current week.
  // For exercises with weekA/weekB variants, merges the week's properties
  // over the base exercise (including id/name overrides for full swaps).
  // For exercises without variants, returns the exercise unchanged.
  function getEffectiveExercise(ex) {
    const variant = isCurrentWeekA() ? ex.weekA : ex.weekB;
    if (!variant) return ex;
    return { ...ex, ...variant };
  }
  ```

- [ ] **Step 2: Verify in browser console**

  Open `index.html` in browser. In DevTools console run:
  ```js
  console.log(isCurrentWeekA()); // true or false — note which week you're in
  console.log(getEffectiveExercise({ id: 'test', reps: '5', weekA: { reps: '5' }, weekB: { reps: '8' } }));
  // Should log the weekA or weekB variant merged with base
  ```
  Expected: no errors, correct variant returned.

- [ ] **Step 3: Commit**

  ```bash
  git add index.html
  git commit -m "feat: add isCurrentWeekA and getEffectiveExercise helpers"
  ```

---

## Task 2: Update TEMPLATES with week A/B variants

**Files:**
- Modify: `index.html` — TEMPLATES array (~lines 506–651)

- [ ] **Step 1: Update bench (mon_upper_push, ~line 507)**

  Replace:
  ```js
  { id: 'bench', name: 'Barbell Bench Press', sets: 4, reps: '5', startWeight: 170, unit: 'lbs', rest: 150, notes: 'RPE 7-8. Add 5lbs when all sets hit.' },
  ```
  With:
  ```js
  { id: 'bench', name: 'Barbell Bench Press', sets: 4, reps: '5', startWeight: 165, unit: 'lbs', rest: 150, notes: 'RPE 7-8. Add 5lbs when all sets hit.',
    weekA: { reps: '5', startWeight: 165, notes: 'Strength week. RPE 7-8.' },
    weekB: { reps: '8', startWeight: 145, notes: 'Volume week. Controlled tempo, full ROM.' } },
  ```

- [ ] **Step 2: Update squat (tue_lower_str, ~line 525)**

  Replace:
  ```js
  { id: 'squat', name: 'Back Squat', sets: 4, reps: '5', startWeight: 205, unit: 'lbs', rest: 180, notes: 'RPE 7-8. Breathe & brace.' },
  ```
  With:
  ```js
  { id: 'squat', name: 'Back Squat', sets: 4, reps: '5', startWeight: 215, unit: 'lbs', rest: 180, notes: 'RPE 7-8. Breathe & brace.',
    weekA: { reps: '5', startWeight: 215, notes: 'Strength week. RPE 7-8. Breathe & brace.' },
    weekB: { reps: '8', startWeight: 185, notes: 'Volume week. Depth focus, controlled descent.' } },
  ```

- [ ] **Step 3: Update row (wed_upper_pull, ~line 542)**

  Replace:
  ```js
  { id: 'row', name: 'Barbell Rows', sets: 4, reps: '6-8', startWeight: 165, unit: 'lbs', rest: 150, notes: 'RPE 7-8. Chest to bar.' },
  ```
  With:
  ```js
  { id: 'row', name: 'Barbell Rows', sets: 4, reps: '6', startWeight: 155, unit: 'lbs', rest: 150, notes: 'RPE 7-8. Chest to bar.',
    weekA: { reps: '6', startWeight: 155, notes: 'Strength week. RPE 7-8. Chest to bar.' },
    weekB: { reps: '10', startWeight: 135, notes: 'Volume week. Squeeze at top of each rep.' } },
  ```

- [ ] **Step 4: Update pull-ups (wed_upper_pull, ~line 543)**

  Replace:
  ```js
  { id: 'pullup', name: 'Pull-ups', sets: 3, reps: '6-10', startWeight: 0, unit: 'BW', rest: 120, notes: 'BW at 220 is plenty. Add weight at 10.' },
  ```
  With:
  ```js
  { id: 'pullup', name: 'Pull-ups', sets: 3, reps: 'max', startWeight: 0, unit: 'BW', rest: 120, notes: 'Log every set. BW at 220 is plenty. Add weight when hitting 10+ consistently.' },
  ```
  (Pull-ups are the same both weeks — no weekA/weekB needed. The goal is just consistent logging.)

- [ ] **Step 5: Update front_squat on sat_lower_hyp (~line 596)**

  Replace:
  ```js
  { id: 'front_squat', name: 'Front Squat', sets: 4, reps: '8', startWeight: 145, unit: 'lbs', rest: 90, notes: 'Lighter than Tue. Depth focus.' },
  ```
  With:
  ```js
  { id: 'front_squat', name: 'Front Squat', sets: 4, reps: '8', startWeight: 145, unit: 'lbs', rest: 90, notes: 'Lighter than Tue. Depth focus.',
    weekA: { reps: '8', startWeight: 145, notes: 'Depth focus. Elbows high.' },
    weekB: { id: 'leg_press', name: 'Leg Press', reps: '12', startWeight: 180, unit: 'lbs', notes: 'Volume week. Full depth, 2s pause at bottom.' } },
  ```

- [ ] **Step 6: Verify templates render without errors**

  Open `index.html` in browser. Check home screen loads. Open DevTools console — no JS errors. Tap into a workout to confirm exercises list renders.

- [ ] **Step 7: Commit**

  ```bash
  git add index.html
  git commit -m "feat: add weekA/weekB variants to bench, squat, row, pullup, front_squat templates"
  ```

---

## Task 3: Use `getEffectiveExercise()` in `renderExerciseInner`

**Files:**
- Modify: `index.html` — `renderExerciseInner` (~line 1005)

- [ ] **Step 1: Resolve effective exercise at the top of `renderExerciseInner`**

  Find `renderExerciseInner(ex, lastSession)` (~line 1005). Insert as the very first line of the function body:

  ```js
  ex = getEffectiveExercise(ex);
  ```

  So the function starts:
  ```js
  function renderExerciseInner(ex, lastSession) {
    ex = getEffectiveExercise(ex);
    const lastEx = lastSession?.exercises?.find(e => e.id === ex.id);
    // ... rest unchanged
  ```

  This ensures `ex.name`, `ex.reps`, `ex.startWeight`, `ex.notes`, and `ex.id` are all week-appropriate before any rendering.

- [ ] **Step 2: Verify in browser**

  Open `index.html`. Navigate to Wednesday Upper Pull workout. Check that:
  - Week A: Barbell Rows shows target `6 reps · Start: 155 lbs`
  - Week B: Barbell Rows shows target `10 reps · Start: 135 lbs`

  Check which week you're in via console: `isCurrentWeekA()`. Confirm the displayed target matches.

  Navigate to Saturday Lower Hyp. Confirm:
  - Week A: "Front Squat" appears with `8 reps · Start: 145 lbs`
  - Week B: "Leg Press" appears with `12 reps · Start: 180 lbs`

- [ ] **Step 3: Commit**

  ```bash
  git add index.html
  git commit -m "feat: resolve week-appropriate exercise targets in renderExerciseInner"
  ```

---

## Task 4: Show Week A/B badge on home screen and pre-workout screen

**Files:**
- Modify: `index.html` — `renderHome` (~line 880), `selectWorkout` (~line 922), HTML pre-workout screen (~line 360)

- [ ] **Step 1: Add Week A/B badge to home screen cards**

  In `renderHome`, find the line that builds `wc-title` (~line 887):
  ```js
  <div class="wc-title">${tmpl.name}${isToday ? '<span class="wc-today-badge">TODAY</span>' : ''}</div>
  ```

  Replace with:
  ```js
  <div class="wc-title">${tmpl.name}${isToday ? '<span class="wc-today-badge">TODAY</span>' : ''}</div>
  ${(!isRest && !tmpl.isLight) ? `<div class="wc-week-badge week-${isCurrentWeekA() ? 'a' : 'b'}">WEEK ${isCurrentWeekA() ? 'A' : 'B'}</div>` : ''}
  ```

- [ ] **Step 2: Add CSS for the week badge**

  In the CSS block, after `.wc-today-badge` styles (search for `wc-today-badge`), add:

  ```css
  .wc-week-badge {
    font-size: 10px; font-weight: 800; letter-spacing: 0.5px;
    padding: 2px 7px; border-radius: 5px; display: inline-block; margin-top: 3px;
  }
  .wc-week-badge.week-a { background: rgba(74,144,217,0.15); color: var(--accent); }
  .wc-week-badge.week-b { background: rgba(155,89,182,0.15); color: var(--purple); }
  ```

- [ ] **Step 3: Add week label to pre-workout screen**

  In the HTML pre-workout screen (~line 360), find the `<div class="readiness-input">` block and insert above it:

  ```html
  <div id="pw-week-label" style="text-align:center;font-size:13px;font-weight:700;margin-bottom:16px;padding:8px 16px;border-radius:8px;"></div>
  ```

  In `selectWorkout()` (~line 922), after `updateReadiness(75)`, add:

  ```js
  const weekLabel = document.getElementById('pw-week-label');
  if (weekLabel) {
    const isA = isCurrentWeekA();
    weekLabel.textContent = isA ? 'Strength Week (A)' : 'Volume Week (B)';
    weekLabel.style.background = isA ? 'rgba(74,144,217,0.12)' : 'rgba(155,89,182,0.12)';
    weekLabel.style.color = isA ? 'var(--accent)' : 'var(--purple)';
  }
  ```

- [ ] **Step 4: Verify in browser**

  Reload `index.html`. Home screen: each workout card (except Rest, Basketball) should show a small "WEEK A" or "WEEK B" badge in blue or purple. Tap any workout — pre-workout screen shows "Strength Week (A)" or "Volume Week (B)" label above the readiness slider.

- [ ] **Step 5: Commit**

  ```bash
  git add index.html
  git commit -m "feat: show Week A/B badge on home and pre-workout screens"
  ```

---

## Task 5: Fix rest timer — collapsible pill

**Files:**
- Modify: `index.html` — CSS rest-bar styles (~line 197), HTML rest-bar (~line 395), `startRestTimer` (~line 1108), `updateRestDisplay` (~line 1126), `skipRest` (~line 1140)

- [ ] **Step 1: Restructure the rest-bar HTML**

  Find the rest-bar HTML block (~lines 394-403):
  ```html
  <!-- ==================== REST TIMER ==================== -->
  <div class="rest-bar" id="rest-bar">
    <div class="rest-label" id="rest-label">Rest</div>
    <div class="rest-time" id="rest-time">0:00</div>
    <div class="rest-progress"><div class="rest-progress-fill" id="rest-fill"></div></div>
    <div class="rest-actions">
      <button class="rest-btn skip" onclick="skipRest()">Skip</button>
      <button class="rest-btn add" onclick="addRest(30)">+30s</button>
    </div>
  </div>
  ```

  Replace with:
  ```html
  <!-- ==================== REST TIMER ==================== -->
  <div class="rest-bar collapsed" id="rest-bar" onclick="toggleRestExpanded()">
    <!-- Collapsed pill (default) -->
    <div class="rest-pill-collapsed">
      <span class="rest-pill-label">Rest</span>
      <span class="rest-time-pill" id="rest-time-pill">0:00</span>
      <span class="rest-pill-hint">tap to expand</span>
    </div>
    <!-- Expanded view -->
    <div class="rest-expanded">
      <div class="rest-label" id="rest-label">Rest</div>
      <div class="rest-time" id="rest-time">0:00</div>
      <div class="rest-progress"><div class="rest-progress-fill" id="rest-fill"></div></div>
      <div class="rest-actions">
        <button class="rest-btn skip" onclick="event.stopPropagation(); skipRest()">Skip</button>
        <button class="rest-btn add" onclick="event.stopPropagation(); addRest(30)">+30s</button>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 2: Replace rest-bar CSS**

  Find and replace the entire `.rest-bar` CSS block (~lines 197-218):

  ```css
  .rest-bar {
    position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface);
    border-top: 1px solid var(--card-border); z-index: 60;
    transform: translateY(100%); transition: transform 0.3s ease;
    cursor: pointer; overflow: hidden;
  }
  .rest-bar.visible { transform: translateY(0); }

  /* Collapsed pill state */
  .rest-bar.collapsed { height: 52px; }
  .rest-bar:not(.collapsed) .rest-pill-collapsed { display: none; }
  .rest-bar.collapsed .rest-expanded { display: none; }

  .rest-pill-collapsed {
    display: flex; align-items: center; gap: 12px;
    padding: 0 20px; height: 52px;
  }
  .rest-pill-label { font-size: 13px; color: var(--text-dim); font-weight: 600; }
  .rest-time-pill {
    font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; flex: 1;
  }
  .rest-pill-hint { font-size: 11px; color: var(--text-muted); }

  /* Expanded state */
  .rest-expanded {
    padding: 16px; padding-bottom: calc(16px + var(--safe-bottom));
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .rest-time { font-size: 52px; font-weight: 800; font-variant-numeric: tabular-nums; }
  .rest-time.warning { color: var(--orange); }
  .rest-time.done { color: var(--green); }
  .rest-label { font-size: 13px; color: var(--text-dim); }
  .rest-progress {
    width: 100%; height: 4px; background: var(--card-border); border-radius: 2px; overflow: hidden;
  }
  .rest-progress-fill { height: 100%; background: var(--accent); transition: width 1s linear; border-radius: 2px; }
  .rest-actions { display: flex; gap: 10px; width: 100%; }
  .rest-btn {
    flex: 1; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 700;
    cursor: pointer; text-align: center; border: none;
  }
  .rest-btn.skip { background: var(--card); color: var(--text); border: 1px solid var(--card-border); }
  .rest-btn.add { background: var(--accent-dim); color: var(--accent); }
  ```

- [ ] **Step 3: Update `startRestTimer` to start collapsed and add screen padding**

  Replace `startRestTimer` (~lines 1108-1124):
  ```js
  function startRestTimer(seconds) {
    clearInterval(state.restTimer);
    state.restSeconds = seconds;
    state.restTarget = seconds;
    const bar = document.getElementById('rest-bar');
    bar.classList.add('visible', 'collapsed');
    bar.classList.remove('expanded-manually');
    // Push workout screen up so pill doesn't cover last row
    const screen = document.getElementById('screen-workout');
    if (screen) screen.style.paddingBottom = '172px'; // 120px base + 52px pill
    updateRestDisplay();

    state.restTimer = setInterval(() => {
      state.restSeconds--;
      updateRestDisplay();
      if (state.restSeconds <= 0) {
        clearInterval(state.restTimer);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }, 1000);
  }
  ```

- [ ] **Step 4: Update `updateRestDisplay` to update pill countdown**

  Replace `updateRestDisplay` (~lines 1126-1138):
  ```js
  function updateRestDisplay() {
    const s = Math.abs(state.restSeconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const prefix = state.restSeconds < 0 ? '+' : '';
    const timeStr = `${prefix}${m}:${sec.toString().padStart(2,'0')}`;

    const el = document.getElementById('rest-time');
    if (el) {
      el.textContent = timeStr;
      el.className = 'rest-time' + (state.restSeconds <= 0 ? ' done' : state.restSeconds <= 10 ? ' warning' : '');
    }

    const pillEl = document.getElementById('rest-time-pill');
    if (pillEl) {
      pillEl.textContent = timeStr;
      pillEl.style.color = state.restSeconds <= 0 ? 'var(--green)' : state.restSeconds <= 10 ? 'var(--orange)' : '';
    }

    const pct = state.restTarget > 0 ? Math.max(0, (state.restSeconds / state.restTarget) * 100) : 0;
    const fill = document.getElementById('rest-fill');
    if (fill) fill.style.width = pct + '%';

    const label = document.getElementById('rest-label');
    if (label) label.textContent = state.restSeconds <= 0 ? 'GO! Time\'s up' : 'Rest';
  }
  ```

- [ ] **Step 5: Update `skipRest` to clear padding and collapsed state**

  Replace `skipRest` (~lines 1140-1143):
  ```js
  function skipRest() {
    clearInterval(state.restTimer);
    const bar = document.getElementById('rest-bar');
    bar.classList.remove('visible', 'collapsed', 'expanded-manually');
    const screen = document.getElementById('screen-workout');
    if (screen) screen.style.paddingBottom = '';
  }
  ```

- [ ] **Step 6: Add `toggleRestExpanded()` function**

  Insert after `skipRest()`:
  ```js
  function toggleRestExpanded() {
    const bar = document.getElementById('rest-bar');
    bar.classList.toggle('collapsed');
  }
  ```

- [ ] **Step 7: Verify in browser (mobile viewport)**

  Open `index.html` in DevTools with mobile viewport (e.g. iPhone 14 Pro, 393px wide). Start any workout. Log a set that has a rest timer (e.g. bench press set 1, rest=150s).

  Confirm:
  - A compact ~52px bar appears at the bottom showing the countdown (e.g. "Rest  2:30  tap to expand")
  - Input fields for the next set are NOT obscured
  - Tapping the pill expands to the full timer view with Skip/+30s buttons
  - Tapping again collapses back to pill
  - Skip button works and removes the bar entirely
  - Bottom padding on the workout screen resets after skip

- [ ] **Step 8: Commit**

  ```bash
  git add index.html
  git commit -m "fix: rest timer collapses to pill by default so it doesn't block set inputs"
  ```

---

## Self-Review Checklist

- [x] `isCurrentWeekA()` and `getEffectiveExercise()` defined before use
- [x] All 5 modified exercises (bench, squat, row, pullup, front_squat) have weekA/weekB (or are intentionally unchanged)
- [x] `renderExerciseInner` resolves effective exercise before reading `ex.id` — history lookup uses correct ID for the week
- [x] `toggleRestExpanded()` defined before referenced in HTML onclick
- [x] `event.stopPropagation()` on Skip/+30s prevents expand toggle from firing
- [x] Screen padding reset on `skipRest` matches the `showScreen` cleanup path
- [x] No "TBD" or placeholder code in any task

---

## Execution Handoff

Tasks 1-4 (undulating periodization) and Task 5 (rest timer) are fully independent — either can be executed first.
