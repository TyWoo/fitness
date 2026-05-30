# Deload Week Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a manual deload mode that halves sets (plyo → 1 set) across all workouts, toggled from the home screen with an amber banner indicator.

**Architecture:** `state.deloadActive` mirrors a `localStorage` flag. A `getDeloadSets(ex)` helper replaces the raw `ex.sets` reference in all three `adjustedSets` calculations. Banners are injected into static placeholder divs on the home, pre-workout, and workout screens.

**Tech Stack:** Vanilla JS, single-file PWA (`index.html`), no build step.

---

### Task 1: State initialization + helper functions

**Files:**
- Modify: `index.html:705-716` (state object)
- Modify: `index.html:1675` (near `getEffectiveExercise`)

- [ ] **Step 1: Add `deloadActive` to state object**

Find the state initialization at line ~705:
```js
let state = {
  activeTemplate: null,
  readiness: 75,
  startTime: null,
  workoutTimer: null,
  restTimer: null,
  restSeconds: 0,
  restTarget: 0,
  setData: {}, // { exerciseId_setIdx: { weight, reps, logged } }
  emomState: null,
  amrapState: null,
};
```
Replace with:
```js
let state = {
  activeTemplate: null,
  readiness: 75,
  startTime: null,
  workoutTimer: null,
  restTimer: null,
  restSeconds: 0,
  restTarget: 0,
  setData: {}, // { exerciseId_setIdx: { weight, reps, logged } }
  emomState: null,
  amrapState: null,
  deloadActive: localStorage.getItem('deload_active') === 'true',
};
```

- [ ] **Step 2: Add `setDeload` and `getDeloadSets` functions**

Find the `getEffectiveExercise` function at line ~1675:
```js
function getEffectiveExercise(ex) {
```
Insert two new functions immediately before it:
```js
function setDeload(on) {
  state.deloadActive = on;
  localStorage.setItem('deload_active', on ? 'true' : 'false');
  renderHome();
}

function getDeloadSets(ex) {
  if (!state.deloadActive) return ex.sets;
  return ex.isPlyo ? 1 : Math.ceil(ex.sets / 2);
}

function getEffectiveExercise(ex) {
```

- [ ] **Step 3: Verify in browser**

Open `index.html` in browser. Open DevTools console. Run:
```js
setDeload(true);
console.log(state.deloadActive); // true
console.log(localStorage.getItem('deload_active')); // "true"
setDeload(false);
console.log(state.deloadActive); // false
```

- [ ] **Step 4: Commit**
```bash
git add index.html
git commit -m "feat: add deloadActive state and setDeload/getDeloadSets helpers"
```

---

### Task 2: CSS styles for deload banner

**Files:**
- Modify: `index.html` (CSS section, near other component styles)

- [ ] **Step 1: Add CSS**

Find an existing component style block to anchor near, e.g. `.exercise-block.superset` at line ~148. Add after it:
```css
.deload-banner-active { background: rgba(184,134,0,0.12); border: 1px solid #b88600; color: #f0a500; border-radius: 10px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 14px; font-weight: 700; margin-bottom: 12px; }
.deload-off-btn { background: rgba(184,134,0,0.2); border: 1px solid #b88600; color: #f0a500; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 700; cursor: pointer; }
.deload-start-link { text-align: center; font-size: 12px; color: var(--text-muted); cursor: pointer; padding: 8px; margin-top: 4px; }
```

- [ ] **Step 2: Commit**
```bash
git add index.html
git commit -m "feat: add deload banner CSS styles"
```

---

### Task 3: Home screen — banner placeholder + renderHome() update

**Files:**
- Modify: `index.html:366-383` (home screen HTML)
- Modify: `index.html:906` (renderHome function)

- [ ] **Step 1: Add placeholder divs to home screen HTML**

Find this block:
```html
  <div class="greeting" id="greeting"></div>
  <div class="workout-cards" id="workout-cards"></div>
```
Replace with:
```html
  <div class="greeting" id="greeting"></div>
  <div id="deload-banner"></div>
  <div class="workout-cards" id="workout-cards"></div>
```

Find this block just before `.home-bottom`:
```html
  <div class="home-bottom">
```
Replace with:
```html
  <div id="deload-link"></div>
  <div class="home-bottom">
```

- [ ] **Step 2: Update renderHome() to populate the placeholders**

In `renderHome()`, find the line that sets `container.innerHTML = html;` (around line 942). Add the following immediately after it:
```js
  // Deload banner / link
  const deloadBanner = document.getElementById('deload-banner');
  deloadBanner.innerHTML = state.deloadActive
    ? `<div class="deload-banner-active">Deload Week Active <button class="deload-off-btn" onclick="setDeload(false)">Turn Off</button></div>`
    : '';
  const deloadLink = document.getElementById('deload-link');
  deloadLink.innerHTML = state.deloadActive
    ? ''
    : `<div class="deload-start-link" onclick="setDeload(true)">Start Deload Week</div>`;
```

- [ ] **Step 3: Verify in browser**

Open `index.html`. The home screen should show a small "Start Deload Week" text at the bottom.
Click it — amber banner appears at the top reading "Deload Week Active" with a "Turn Off" button.
Click "Turn Off" — banner disappears, link reappears.
Reload the page with deload on — banner persists (localStorage).

- [ ] **Step 4: Commit**
```bash
git add index.html
git commit -m "feat: add deload toggle banner to home screen"
```

---

### Task 4: Pre-workout and workout screen banners

**Files:**
- Modify: `index.html:386-406` (pre-workout screen HTML)
- Modify: `index.html:970` (selectWorkout function)
- Modify: `index.html:407-420` (workout screen HTML)
- Modify: `index.html:1005` (startWorkout function)

- [ ] **Step 1: Add placeholder to pre-workout screen HTML**

Find:
```html
    <div id="pw-week-label" style="display:none;text-align:center;font-size:13px;font-weight:700;margin-bottom:16px;padding:8px 16px;border-radius:8px;"></div>
```
Add immediately after:
```html
    <div id="pw-deload-banner"></div>
```

- [ ] **Step 2: Update selectWorkout() to populate the pre-workout banner**

In `selectWorkout()`, find `showScreen('pre');` at the end of the function. Add before it:
```js
  const pwDeload = document.getElementById('pw-deload-banner');
  if (pwDeload) {
    pwDeload.innerHTML = state.deloadActive
      ? `<div class="deload-banner-active" style="margin-bottom:16px">Deload Week Active — sets reduced</div>`
      : '';
  }
```

- [ ] **Step 3: Add placeholder to workout screen HTML**

Find:
```html
  <div id="exercise-list"></div>
```
Replace with:
```html
  <div id="wo-deload-banner"></div>
  <div id="exercise-list"></div>
```

- [ ] **Step 4: Update startWorkout() to populate the workout banner**

In `startWorkout()`, find `renderExercises();`. Add before it:
```js
  const woBanner = document.getElementById('wo-deload-banner');
  if (woBanner) {
    woBanner.innerHTML = state.deloadActive
      ? `<div class="deload-banner-active" style="margin:12px 16px 0">Deload Week — sets reduced</div>`
      : '';
  }
```

- [ ] **Step 5: Verify in browser**

With deload on, tap any workout — the pre-workout screen should show the amber banner.
Tap "Start Workout" — the workout screen should show the amber banner above the exercise list.
With deload off — no banners on either screen.

- [ ] **Step 6: Commit**
```bash
git add index.html
git commit -m "feat: show deload banner on pre-workout and workout screens"
```

---

### Task 5: Wire getDeloadSets into all adjustedSets calculations

**Files:**
- Modify: `index.html:1069` (renderExerciseInner)
- Modify: `index.html:1159` (updateBadge)
- Modify: `index.html:1438` (buildSessionData)

The pattern is identical in all three locations, so each Edit must include enough surrounding context to be unique. Use the exact strings below.

- [ ] **Step 1: Update renderExerciseInner (~line 1069)**

```
old_string:
function renderExerciseInner(ex, lastSession) {
  ex = getEffectiveExercise(ex);
  const lastEx = lastSession?.exercises?.find(e => e.id === ex.id);
  const adjustedSets = state.readiness < 70 && state.readiness >= 55 ? Math.max(ex.sets - 1, 1) : ex.sets;

new_string:
function renderExerciseInner(ex, lastSession) {
  ex = getEffectiveExercise(ex);
  const lastEx = lastSession?.exercises?.find(e => e.id === ex.id);
  const baseSets = getDeloadSets(ex);
  const adjustedSets = state.readiness < 70 && state.readiness >= 55 ? Math.max(baseSets - 1, 1) : baseSets;
```

- [ ] **Step 2: Update updateBadge (~line 1159)**

```
old_string:
  const ex = rawEx ? getEffectiveExercise(rawEx) : tmpl.exercises.find(e => getEffectiveExercise(e).id === exId);
  if (!ex) return;
  const adjustedSets = state.readiness < 70 && state.readiness >= 55 ? Math.max(ex.sets - 1, 1) : ex.sets;

new_string:
  const ex = rawEx ? getEffectiveExercise(rawEx) : tmpl.exercises.find(e => getEffectiveExercise(e).id === exId);
  if (!ex) return;
  const baseSets = getDeloadSets(ex);
  const adjustedSets = state.readiness < 70 && state.readiness >= 55 ? Math.max(baseSets - 1, 1) : baseSets;
```

- [ ] **Step 3: Update buildSessionData (~line 1438)**

```
old_string:
    ex = getEffectiveExercise(ex); // resolve week-appropriate id/name
    const adjustedSets = state.readiness < 70 && state.readiness >= 55 ? Math.max(ex.sets - 1, 1) : ex.sets;

new_string:
    ex = getEffectiveExercise(ex); // resolve week-appropriate id/name
    const baseSets = getDeloadSets(ex);
    const adjustedSets = state.readiness < 70 && state.readiness >= 55 ? Math.max(baseSets - 1, 1) : baseSets;
```

- [ ] **Step 4: Verify in browser**

Enable deload. Tap a workout with plyo exercises (Saturday — Lower Hyp + Plyos):
- Depth Drops: should show 2 sets (3 → ceil(3/2))
- Broad Jumps: should show 1 set (isPlyo → 1)
- Box Jump: should show 1 set (isPlyo → 1)
- Front Squat: should show 2 sets (4 → ceil(4/2))
- Calf Raise: should show 2 sets (4 → ceil(4/2))

Tap a regular workout (Monday — Upper Strength):
- Bench Press: should show 2 sets (4 → ceil(4/2))
- OHP: should show 2 sets (3 → ceil(3/2))

Badge completion counts should also reflect the reduced set counts.

Disable deload — all set counts return to normal.

- [ ] **Step 5: Commit**
```bash
git add index.html
git commit -m "feat: apply deload set reduction in all exercise rendering and session data"
```
