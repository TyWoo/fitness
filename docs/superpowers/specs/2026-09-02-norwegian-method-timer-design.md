# Norwegian 4x4 Interval Timer — Design Spec

**Date:** 2026-09-02
**Status:** Draft
**Location:** New screen in `index.html` (existing fitness PWA)

## Problem

Tyler runs the Norwegian 4x4 method: 4 minutes at 80-85% max HR, then 3 minutes recovery dropping to Zone 2, repeated 4 times. Currently uses MapMyRun + Polar Beat side by side. Wants a single tool that times intervals, reads live heart rate from his Polar H10 chest strap, tracks distance/pace via GPS, and reports per-interval metrics.

## Solution

A new "Norwegian 4x4" screen in `index.html` that connects to the Polar H10 via Web Bluetooth, tracks GPS location for distance/pace, runs a configurable interval timer with audio + vibration + visual cues, and saves session data to localStorage + Supabase.

## User Flow

1. **Home screen** — New "Norwegian 4x4" card below the weekly workout cards. Tap to enter.
2. **Setup screen** — "Connect Polar H10" button (browser Bluetooth picker). Pre-filled defaults: 4 min work / 3 min recovery / 4 cycles. Editable cycle count. Resting HR field (default 60 bpm).
3. **Running screen** — Full-screen display:
   - Current phase: WORK (red) or RECOVER (green)
   - Countdown timer (MM:SS)
   - Live HR (large) + current zone label
   - Target zone indicator (in target / above / below)
   - Cycle progress ("Cycle 2 of 4")
   - Distance (km) + current pace (min/km)
4. **Summary screen** — Per-interval cards, zone time breakdown, totals. Auto-syncs to Supabase. Export buttons for CSV/JSON.

## Technical Design

### Heart Rate: Web Bluetooth

- Standard Bluetooth Heart Rate Service (`0x180D`)
- Heart Rate Measurement characteristic (`0x2A37`) pushes values at ~1Hz
- Chrome on Android (Pixel 7) supports this natively
- Browser's built-in device picker handles pairing
- On disconnect: show warning banner, display "---" for HR, keep timer running. Tap to reconnect.

### GPS: Geolocation API

- `navigator.geolocation.watchPosition()` with `enableHighAccuracy: true`
- Haversine formula for distance between consecutive points
- Filter out points with accuracy > 20m to avoid GPS jumps
- Current pace: rolling window of last ~30 seconds of GPS points
- Per-interval distance and pace tracked separately

### Timer

- `setInterval` at 1-second ticks
- Phase sequence: 4 min work -> 3 min recovery -> repeat (configurable cycles, default 4)
- Total: 8 intervals per session (4 work + 4 recovery)

### Notifications

- **Audio:** Web Audio API (`OscillatorNode`). Ascending tone for "GO" (start work), descending tone for "RECOVER". No audio files needed.
- **Vibration:** `navigator.vibrate([200, 100, 200])` on each phase transition
- **Visual:** Phase color change (red/green), brief flash on transition
- **10-second warning:** Short beep + vibration at 10 seconds remaining in each phase

### Screen Wake Lock

- `navigator.wakeLock.request('screen')` to prevent display sleep during session
- Release on session end or navigation away

### Heart Rate Zones: Karvonen Method

Zones calculated using heart rate reserve (HRR).

- **Max HR:** 178 bpm (hardcoded)
- **Resting HR:** 60 bpm (default, editable in setup screen)
- **HRR:** 118 bpm

Formula: `target = restingHR + (HRR * intensity%)`

| Zone | Intensity | BPM Range |
|------|-----------|-----------|
| Z1   | 50-60%    | 119-131   |
| Z2   | 60-70%    | 131-143   |
| Z3   | 70-80%    | 143-154   |
| Z4   | 80-90%    | 154-166   |
| Z5   | 90-100%   | 166-178   |

**Norwegian method targets:**
- Work intervals: Zone 4 (154-166 bpm, ~80-85% intensity)
- Recovery intervals: Zone 2 (131-143 bpm)

**Future:** Pull resting HR automatically from Google Fit or Ultrahuman API instead of manual entry.

### Data Model

Session object stored in localStorage and synced to Supabase:

```json
{
  "type": "norwegian_4x4",
  "date": "2026-09-02T14:30:00.000Z",
  "dateLocal": "2026-09-02",
  "duration_seconds": 1680,
  "config": {
    "maxHR": 178,
    "restingHR": 60,
    "workDuration": 240,
    "recoveryDuration": 180,
    "cycles": 4
  },
  "intervals": [
    {
      "phase": "work",
      "cycle": 1,
      "duration": 240,
      "hr": { "avg": 158, "min": 145, "max": 165, "samples": [145, 148, ...] },
      "distance_km": 0.82,
      "pace_avg": "5:12"
    },
    {
      "phase": "recovery",
      "cycle": 1,
      "duration": 180,
      "hr": { "avg": 135, "min": 128, "max": 142, "samples": [142, 140, ...] },
      "distance_km": 0.45,
      "pace_avg": "6:40"
    }
  ],
  "totals": {
    "distance_km": 5.1,
    "avg_pace": "5:30",
    "avg_hr": 148,
    "max_hr": 168,
    "time_in_zone_seconds": {
      "z1": 0,
      "z2": 620,
      "z3": 180,
      "z4": 840,
      "z5": 40
    }
  }
}
```

### Supabase Sync

Same pattern as gym workouts. POST to `workout_sessions` on session completion:

```json
{
  "date_local": "2026-09-02",
  "date_iso": "2026-09-02T14:30:00.000Z",
  "template_id": "norwegian_4x4",
  "template_name": "Norwegian 4x4",
  "duration_seconds": 1680,
  "readiness": null,
  "exercises": null,
  "norwegian": {
    "config": { "maxHR": 178, "restingHR": 60, "cycles": 4 },
    "intervals": [...],
    "totals": {...}
  }
}
```

Uses existing `sbHeaders()` and Supabase constants. May need a `norwegian` JSONB column added to the `workout_sessions` table, or repurpose the `exercises` column.

### Export

- **CSV:** One row per interval — columns: cycle, phase, duration, avg_hr, min_hr, max_hr, distance_km, pace. Uses `Blob` + download link.
- **JSON:** Full session object via existing `downloadJSON()` helper.
- Both available as buttons on the summary screen. Supabase sync is automatic.

## Integration with Existing App

- New screen: `<div id="screen-norwegian" class="screen">` in HTML
- New CSS section for Norwegian-specific styles (phase colors, HR display, timer)
- New JS section at the bottom for all Norwegian logic (Bluetooth, GPS, timer, summary)
- Home screen: new card added via `renderHome()` — always visible, not tied to day-of-week
- `showScreen('norwegian')` added to the router
- `cleanup()` extended to stop Norwegian timers/watchers if active
- `beforeunload` warning extended for active Norwegian sessions

## UI Design

Follows existing design system:
- Dark theme (`--bg`, `--card`, `--surface` tokens)
- Card-based layout with `--radius` border radius
- Work phase: `--red` / `--red-dim` background
- Recovery phase: `--green` / `--green-dim` background
- Zone indicator uses existing color tokens (green for Z2, red for Z4-5)
- Timer text: large monospace, 48px+
- HR text: 64px+ bold

## Out of Scope (v1)

- Map/route visualization
- Integration with MapMyRun or Polar Beat/Flow
- Auto-pull resting HR from Google Fit / Ultrahuman (future hook noted)
- Warm-up / cool-down phases
- Variable interval durations within a session
