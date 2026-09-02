# Norwegian 4x4 Interval Timer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Norwegian 4x4 interval running screen to the existing fitness PWA with live Polar H10 heart rate via Web Bluetooth, GPS distance/pace/elevation, interval timer with audio+vibration+visual cues, and auto-sync to Supabase.

**Architecture:** Single-file addition to `index.html`. New CSS section for Norwegian styles, new HTML screens (setup, running, summary), new JS section with Web Bluetooth HR, Geolocation GPS, interval timer, Karvonen zones, and session persistence. Follows existing patterns: `showScreen()` routing, `innerHTML` rendering, localStorage + Supabase sync.

**Tech Stack:** Vanilla JS, Web Bluetooth API, Geolocation API, Web Audio API, Screen Wake Lock API. No new dependencies.

---

### Task 1: CSS — Norwegian Screen Styles

**Files:**
- Modify: `index.html` (CSS section, after existing styles ~line 365)

- [ ] **Step 1: Add Norwegian CSS variables and styles**

Insert this CSS block before the closing `</style>` tag (before line 367):

```css
/* ===== NORWEGIAN 4x4 ===== */
.norw-setup { padding: 20px 0; }
.norw-setup-title { font-size: 20px; font-weight: 800; margin-bottom: 16px; }
.norw-connect-btn {
  width: 100%; padding: 16px; background: var(--accent); color: #fff;
  border: none; border-radius: var(--radius); font-size: 16px; font-weight: 700;
  cursor: pointer; margin-bottom: 16px; transition: opacity 0.15s;
}
.norw-connect-btn:active { opacity: 0.8; }
.norw-connect-btn.connected { background: var(--green); }
.norw-connect-btn.connecting { background: var(--orange); }
.norw-config-card {
  background: var(--card); border: 1px solid var(--card-border);
  border-radius: var(--radius); padding: 16px; margin-bottom: 12px;
}
.norw-config-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0;
}
.norw-config-row label { font-size: 14px; color: var(--text-dim); }
.norw-config-row input {
  width: 70px; padding: 8px; background: var(--surface); border: 1px solid var(--card-border);
  border-radius: var(--radius-sm); color: var(--text); font-size: 16px; text-align: center;
  font-weight: 700;
}
.norw-start-btn {
  width: 100%; padding: 18px; background: var(--green); color: #fff;
  border: none; border-radius: var(--radius); font-size: 18px; font-weight: 800;
  cursor: pointer; margin-top: 16px; letter-spacing: 0.5px;
}
.norw-start-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Running screen */
.norw-running { text-align: center; padding: 20px 0; min-height: 100vh; display: flex; flex-direction: column; }
.norw-phase {
  font-size: 18px; font-weight: 800; letter-spacing: 2px; padding: 8px 24px;
  border-radius: 8px; display: inline-block; margin-bottom: 8px;
}
.norw-phase.work { background: var(--red-dim); color: var(--red); }
.norw-phase.recover { background: var(--green-dim); color: var(--green); }
.norw-countdown {
  font-size: 72px; font-weight: 800; font-family: 'SF Mono', 'JetBrains Mono', monospace;
  letter-spacing: -2px; margin: 8px 0;
}
.norw-hr-display { font-size: 64px; font-weight: 800; margin: 4px 0; }
.norw-hr-display .bpm-label { font-size: 18px; font-weight: 600; color: var(--text-dim); }
.norw-zone-badge {
  display: inline-block; padding: 4px 14px; border-radius: 8px;
  font-size: 14px; font-weight: 700; margin-bottom: 12px;
}
.norw-zone-badge.target { background: var(--green-dim); color: var(--green); }
.norw-zone-badge.above { background: var(--red-dim); color: var(--red); }
.norw-zone-badge.below { background: var(--orange-dim); color: var(--orange); }
.norw-cycle { font-size: 14px; color: var(--text-dim); font-weight: 600; margin-bottom: 12px; }
.norw-metrics {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;
  margin-top: auto; padding: 12px 0;
}
.norw-metric {
  background: var(--card); border: 1px solid var(--card-border);
  border-radius: var(--radius-sm); padding: 12px 8px; text-align: center;
}
.norw-metric-val { font-size: 20px; font-weight: 800; }
.norw-metric-label { font-size: 11px; color: var(--text-dim); margin-top: 2px; }
.norw-stop-btn {
  width: 100%; padding: 14px; background: var(--red); color: #fff;
  border: none; border-radius: var(--radius); font-size: 16px; font-weight: 700;
  cursor: pointer; margin-top: 12px;
}
.norw-bt-warning {
  background: var(--orange-dim); color: var(--orange); padding: 8px 16px;
  border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 8px;
  cursor: pointer; display: none;
}
.norw-flash { animation: norw-flash-anim 0.5s ease-out; }
@keyframes norw-flash-anim {
  0% { opacity: 0.3; } 100% { opacity: 1; }
}

/* Summary — Norwegian-specific */
.norw-summary-header { text-align: center; padding: 24px 0 16px; }
.norw-summary-header h2 { font-size: 22px; font-weight: 800; }
.norw-interval-card {
  background: var(--card); border: 1px solid var(--card-border);
  border-radius: var(--radius); padding: 14px; margin-bottom: 10px;
}
.norw-interval-card.work { border-left: 4px solid var(--red); }
.norw-interval-card.recovery { border-left: 4px solid var(--green); }
.norw-interval-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
}
.norw-interval-phase { font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }
.norw-interval-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;
}
.norw-interval-stat { font-size: 12px; color: var(--text-dim); }
.norw-interval-stat span { display: block; font-size: 16px; font-weight: 700; color: var(--text); }
.norw-zone-bar {
  display: flex; height: 24px; border-radius: 6px; overflow: hidden; margin: 16px 0;
}
.norw-zone-bar div { transition: width 0.3s; }
.norw-totals {
  background: var(--card); border: 1px solid var(--card-border);
  border-radius: var(--radius); padding: 16px; margin-bottom: 16px;
}
.norw-totals-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.norw-totals-grid .norw-interval-stat span { font-size: 18px; }
.norw-export-btns { display: flex; gap: 10px; margin-top: 16px; }
.norw-export-btn {
  flex: 1; padding: 14px; background: var(--card); border: 1px solid var(--card-border);
  border-radius: var(--radius); color: var(--text); font-size: 14px; font-weight: 600;
  cursor: pointer; text-align: center;
}
.norw-export-btn:active { background: var(--surface); }
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "style: add Norwegian 4x4 CSS styles"
```

---

### Task 2: HTML — Setup, Running, and Summary Screens

**Files:**
- Modify: `index.html` (HTML section, after `screen-history` div ~line 478)

- [ ] **Step 1: Add Norwegian setup screen HTML**

Insert after the closing `</div>` of `screen-history` (after line 478) and before the `<div id="toast"` element:

```html
<!-- ==================== NORWEGIAN 4x4 SETUP ==================== -->
<div id="screen-norwegian" class="screen">
  <div class="norw-setup">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <button class="back-btn" onclick="norwCleanup(); showScreen('home')">←</button>
      <div class="norw-setup-title" style="margin:0;flex:1;">Norwegian 4×4</div>
    </div>

    <button class="norw-connect-btn" id="norw-connect-btn" onclick="norwConnectHR()">
      ❤️ Connect Polar H10
    </button>

    <div class="norw-config-card">
      <div class="norw-config-row">
        <label>Work Duration (min)</label>
        <input type="number" id="norw-work-dur" value="4" min="1" max="10">
      </div>
      <div class="norw-config-row">
        <label>Recovery Duration (min)</label>
        <input type="number" id="norw-recov-dur" value="3" min="1" max="10">
      </div>
      <div class="norw-config-row">
        <label>Cycles</label>
        <input type="number" id="norw-cycles" value="4" min="1" max="10">
      </div>
      <div class="norw-config-row">
        <label>Resting HR (bpm)</label>
        <input type="number" id="norw-resting-hr" value="60" min="30" max="100">
      </div>
    </div>

    <button class="norw-start-btn" id="norw-start-btn" onclick="norwStart()">
      START RUN
    </button>
  </div>
</div>

<!-- ==================== NORWEGIAN 4x4 RUNNING ==================== -->
<div id="screen-norw-running" class="screen">
  <div class="norw-running">
    <div class="norw-bt-warning" id="norw-bt-warning" onclick="norwReconnectHR()">
      ⚠️ HR disconnected — tap to reconnect
    </div>
    <div class="norw-phase" id="norw-phase">WORK</div>
    <div class="norw-countdown" id="norw-countdown">4:00</div>
    <div class="norw-hr-display" id="norw-hr">---<span class="bpm-label"> bpm</span></div>
    <div class="norw-zone-badge" id="norw-zone-badge">--</div>
    <div class="norw-cycle" id="norw-cycle">Cycle 1 of 4</div>
    <div class="norw-metrics">
      <div class="norw-metric">
        <div class="norw-metric-val" id="norw-dist">0.00</div>
        <div class="norw-metric-label">km</div>
      </div>
      <div class="norw-metric">
        <div class="norw-metric-val" id="norw-pace">--:--</div>
        <div class="norw-metric-label">min/km</div>
      </div>
      <div class="norw-metric">
        <div class="norw-metric-val" id="norw-elev">0</div>
        <div class="norw-metric-label">↑ elev (m)</div>
      </div>
    </div>
    <button class="norw-stop-btn" onclick="norwStop()">STOP</button>
  </div>
</div>

<!-- ==================== NORWEGIAN 4x4 SUMMARY ==================== -->
<div id="screen-norw-summary" class="screen">
  <div class="norw-summary-header">
    <div style="font-size:40px;margin-bottom:8px;">🏃</div>
    <h2>Run Complete!</h2>
    <div class="duration" id="norw-sum-duration"></div>
    <div id="norw-sync-status" style="margin-top:8px;font-size:11px;font-family:'JetBrains Mono','SF Mono',monospace;letter-spacing:0.3px;"></div>
  </div>
  <div id="norw-sum-intervals"></div>
  <div style="font-size:13px;font-weight:700;color:var(--text-dim);margin:16px 0 8px;letter-spacing:0.5px;">ZONE TIME</div>
  <div class="norw-zone-bar" id="norw-zone-bar"></div>
  <div class="norw-totals" id="norw-sum-totals"></div>
  <div class="norw-export-btns">
    <div class="norw-export-btn" onclick="norwExportCSV()">📊 Export CSV</div>
    <div class="norw-export-btn" onclick="norwExportJSON()">📤 Export JSON</div>
    <div class="norw-export-btn" onclick="showScreen('home')">← Done</div>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add Norwegian 4x4 HTML screens (setup, running, summary)"
```

---

### Task 3: JS — Karvonen Zones and Norwegian State

**Files:**
- Modify: `index.html` (JS section, before the closing `</script>` tag)

- [ ] **Step 1: Add Norwegian constants, state, and zone calculation**

Insert before the `// Init` line near the end of the `<script>` block (~line 1706):

```javascript
// ============================================================
// NORWEGIAN 4x4
// ============================================================
const NORW_MAX_HR = 178;
const NORW_ZONE_RANGES = [
  { zone: 1, min: 0.50, max: 0.60 },
  { zone: 2, min: 0.60, max: 0.70 },
  { zone: 3, min: 0.70, max: 0.80 },
  { zone: 4, min: 0.80, max: 0.90 },
  { zone: 5, min: 0.90, max: 1.00 },
];
const NORW_ZONE_COLORS = { 1: '#3498db', 2: '#2ecc71', 3: '#f1c40f', 4: '#e67e22', 5: '#e74c3c' };

const norwState = {
  // Config
  workDuration: 240,
  recoveryDuration: 180,
  cycles: 4,
  restingHR: 60,
  // Bluetooth
  btDevice: null,
  btCharacteristic: null,
  hrConnected: false,
  currentHR: null,
  // GPS
  gpsWatchId: null,
  lastPosition: null,
  gpsPoints: [],       // {lat, lon, alt, time, accuracy}
  // Timer
  timerInterval: null,
  phase: 'work',       // 'work' | 'recovery'
  currentCycle: 1,
  secondsLeft: 240,
  running: false,
  // Wake lock
  wakeLock: null,
  // Session data
  startTime: null,
  intervals: [],       // completed intervals
  currentInterval: null, // interval being recorded now
  // Audio
  audioCtx: null,
};

function norwGetZoneBounds(restingHR) {
  const hrr = NORW_MAX_HR - restingHR;
  return NORW_ZONE_RANGES.map(z => ({
    zone: z.zone,
    lo: Math.round(restingHR + hrr * z.min),
    hi: Math.round(restingHR + hrr * z.max),
  }));
}

function norwGetZone(hr, restingHR) {
  if (!hr) return null;
  const bounds = norwGetZoneBounds(restingHR);
  for (let i = bounds.length - 1; i >= 0; i--) {
    if (hr >= bounds[i].lo) return bounds[i].zone;
  }
  return 1;
}

function norwGetTargetZone() {
  return norwState.phase === 'work' ? 4 : 2;
}

function norwGetTargetStatus(hr) {
  if (!hr) return 'below';
  const target = norwGetTargetZone();
  const bounds = norwGetZoneBounds(norwState.restingHR);
  const range = bounds[target - 1];
  if (hr < range.lo) return 'below';
  if (hr > range.hi) return 'above';
  return 'target';
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add Norwegian state, Karvonen zone calculation"
```

---

### Task 4: JS — Web Bluetooth Heart Rate

**Files:**
- Modify: `index.html` (JS section, after Task 3's code)

- [ ] **Step 1: Add Bluetooth connect, disconnect, and HR parsing**

```javascript
// ── Bluetooth HR ──────────────────────────────────────────────
async function norwConnectHR() {
  const btn = document.getElementById('norw-connect-btn');
  btn.className = 'norw-connect-btn connecting';
  btn.textContent = '⏳ Connecting...';
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
      optionalServices: ['heart_rate'],
    });
    device.addEventListener('gattserverdisconnected', norwOnHRDisconnect);
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('heart_rate');
    const char = await service.getCharacteristic('heart_rate_measurement');
    char.addEventListener('characteristicvaluechanged', norwOnHRValue);
    await char.startNotifications();
    norwState.btDevice = device;
    norwState.btCharacteristic = char;
    norwState.hrConnected = true;
    btn.className = 'norw-connect-btn connected';
    btn.textContent = '✓ Polar H10 Connected';
  } catch (err) {
    console.error('BT connect error:', err);
    btn.className = 'norw-connect-btn';
    btn.textContent = '❤️ Connect Polar H10';
    if (err.name !== 'NotFoundError') {
      showToast('Bluetooth error: ' + err.message, true);
    }
  }
}

function norwOnHRValue(event) {
  const value = event.target.value;
  const flags = value.getUint8(0);
  const is16Bit = flags & 0x01;
  const hr = is16Bit ? value.getUint16(1, true) : value.getUint8(1);
  norwState.currentHR = hr;
  if (norwState.running && norwState.currentInterval) {
    norwState.currentInterval.hrSamples.push(hr);
  }
  // Update display if on running screen
  const hrEl = document.getElementById('norw-hr');
  if (hrEl && norwState.running) {
    hrEl.innerHTML = hr + '<span class="bpm-label"> bpm</span>';
    norwUpdateZoneBadge(hr);
  }
}

function norwOnHRDisconnect() {
  norwState.hrConnected = false;
  norwState.currentHR = null;
  const warning = document.getElementById('norw-bt-warning');
  if (warning) warning.style.display = 'block';
  const hrEl = document.getElementById('norw-hr');
  if (hrEl) hrEl.innerHTML = '---<span class="bpm-label"> bpm</span>';
  // Update setup button if on setup screen
  const btn = document.getElementById('norw-connect-btn');
  if (btn) {
    btn.className = 'norw-connect-btn';
    btn.textContent = '❤️ Connect Polar H10';
  }
}

async function norwReconnectHR() {
  if (norwState.btDevice && norwState.btDevice.gatt) {
    try {
      const server = await norwState.btDevice.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const char = await service.getCharacteristic('heart_rate_measurement');
      char.addEventListener('characteristicvaluechanged', norwOnHRValue);
      await char.startNotifications();
      norwState.btCharacteristic = char;
      norwState.hrConnected = true;
      const warning = document.getElementById('norw-bt-warning');
      if (warning) warning.style.display = 'none';
    } catch (err) {
      showToast('Reconnect failed: ' + err.message, true);
    }
  }
}

function norwUpdateZoneBadge(hr) {
  const badge = document.getElementById('norw-zone-badge');
  if (!badge) return;
  const zone = norwGetZone(hr, norwState.restingHR);
  const status = norwGetTargetStatus(hr);
  const target = norwGetTargetZone();
  badge.textContent = `Zone ${zone} — ${status === 'target' ? 'IN TARGET' : status === 'above' ? 'ABOVE Z' + target : 'BELOW Z' + target}`;
  badge.className = 'norw-zone-badge ' + status;
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add Web Bluetooth HR connection for Norwegian timer"
```

---

### Task 5: JS — GPS Distance, Pace, and Elevation

**Files:**
- Modify: `index.html` (JS section, after Task 4's code)

- [ ] **Step 1: Add GPS tracking with haversine, pace, and elevation**

```javascript
// ── GPS ───────────────────────────────────────────────────────
function norwStartGPS() {
  if (!navigator.geolocation) { showToast('GPS not available', true); return; }
  norwState.gpsPoints = [];
  norwState.lastPosition = null;
  norwState.gpsWatchId = navigator.geolocation.watchPosition(
    norwOnGPSPosition,
    (err) => console.warn('GPS error:', err.message),
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
  );
}

function norwStopGPS() {
  if (norwState.gpsWatchId !== null) {
    navigator.geolocation.clearWatch(norwState.gpsWatchId);
    norwState.gpsWatchId = null;
  }
}

function norwOnGPSPosition(pos) {
  const { latitude, longitude, altitude, accuracy } = pos.coords;
  if (accuracy > 20) return; // skip inaccurate points
  const point = { lat: latitude, lon: longitude, alt: altitude, time: Date.now(), accuracy };
  norwState.gpsPoints.push(point);
  if (norwState.lastPosition && norwState.currentInterval) {
    const dist = haversine(norwState.lastPosition.lat, norwState.lastPosition.lon, latitude, longitude);
    norwState.currentInterval.distance += dist;
    // Elevation
    if (altitude !== null && norwState.lastPosition.alt !== null) {
      const elevDiff = altitude - norwState.lastPosition.alt;
      if (elevDiff > 0) norwState.currentInterval.elevGain += elevDiff;
      else norwState.currentInterval.elevLoss += Math.abs(elevDiff);
    }
  }
  norwState.lastPosition = point;
  norwUpdateMetrics();
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function norwGetTotalDistance() {
  let total = 0;
  norwState.intervals.forEach(iv => total += iv.distance);
  if (norwState.currentInterval) total += norwState.currentInterval.distance;
  return total;
}

function norwGetCurrentPace() {
  // Rolling pace from GPS points in the last 30 seconds
  const now = Date.now();
  const recent = norwState.gpsPoints.filter(p => now - p.time < 30000);
  if (recent.length < 2) return null;
  const first = recent[0];
  const last = recent[recent.length - 1];
  const dist = haversine(first.lat, first.lon, last.lat, last.lon);
  const timeSec = (last.time - first.time) / 1000;
  if (dist < 0.005 || timeSec < 5) return null; // too little data
  const paceSecPerKm = timeSec / dist;
  return paceSecPerKm;
}

function norwFormatPace(secPerKm) {
  if (!secPerKm || secPerKm > 3600) return '--:--';
  const m = Math.floor(secPerKm / 60);
  const s = Math.floor(secPerKm % 60);
  return m + ':' + s.toString().padStart(2, '0');
}

function norwGetTotalElevGain() {
  let total = 0;
  norwState.intervals.forEach(iv => total += iv.elevGain);
  if (norwState.currentInterval) total += norwState.currentInterval.elevGain;
  return total;
}

function norwUpdateMetrics() {
  const distEl = document.getElementById('norw-dist');
  const paceEl = document.getElementById('norw-pace');
  const elevEl = document.getElementById('norw-elev');
  if (distEl) distEl.textContent = norwGetTotalDistance().toFixed(2);
  if (paceEl) paceEl.textContent = norwFormatPace(norwGetCurrentPace());
  if (elevEl) elevEl.textContent = Math.round(norwGetTotalElevGain());
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add GPS distance, pace, and elevation tracking"
```

---

### Task 6: JS — Audio Cues and Vibration

**Files:**
- Modify: `index.html` (JS section, after Task 5's code)

- [ ] **Step 1: Add Web Audio API tone generation and vibration**

```javascript
// ── Audio & Vibration ─────────────────────────────────────────
function norwGetAudioCtx() {
  if (!norwState.audioCtx) {
    norwState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return norwState.audioCtx;
}

function norwPlayTone(freqStart, freqEnd, duration) {
  try {
    const ctx = norwGetAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* audio not available */ }
}

function norwPlayGo() {
  // Ascending tone — "start work"
  norwPlayTone(440, 880, 0.3);
  setTimeout(() => norwPlayTone(880, 1320, 0.3), 350);
}

function norwPlayRecover() {
  // Descending tone — "recover"
  norwPlayTone(880, 440, 0.4);
}

function norwPlayWarning() {
  // Short beep — 10-second warning
  norwPlayTone(660, 660, 0.15);
}

function norwVibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add audio cues and vibration for interval transitions"
```

---

### Task 7: JS — Interval Timer Core

**Files:**
- Modify: `index.html` (JS section, after Task 6's code)

- [ ] **Step 1: Add timer start, tick, phase transition, and stop logic**

```javascript
// ── Timer Core ────────────────────────────────────────────────
function norwStart() {
  // Read config
  norwState.workDuration = parseInt(document.getElementById('norw-work-dur').value) * 60;
  norwState.recoveryDuration = parseInt(document.getElementById('norw-recov-dur').value) * 60;
  norwState.cycles = parseInt(document.getElementById('norw-cycles').value);
  norwState.restingHR = parseInt(document.getElementById('norw-resting-hr').value);

  // Init state
  norwState.phase = 'work';
  norwState.currentCycle = 1;
  norwState.secondsLeft = norwState.workDuration;
  norwState.running = true;
  norwState.startTime = Date.now();
  norwState.intervals = [];
  norwState.currentInterval = norwNewInterval('work', 1);

  // Resume audio context (required after user gesture on Android)
  norwGetAudioCtx().resume();

  // Start GPS
  norwStartGPS();

  // Request wake lock
  norwRequestWakeLock();

  // Start timer
  clearInterval(norwState.timerInterval);
  norwState.timerInterval = setInterval(norwTick, 1000);

  // Play starting tone
  norwPlayGo();
  norwVibrate([200, 100, 200]);

  // Update display
  norwRenderRunning();
  showScreen('norw-running');
}

function norwNewInterval(phase, cycle) {
  return {
    phase,
    cycle,
    duration: phase === 'work' ? norwState.workDuration : norwState.recoveryDuration,
    hrSamples: [],
    distance: 0,
    elevGain: 0,
    elevLoss: 0,
    startTime: Date.now(),
  };
}

function norwTick() {
  if (!norwState.running) return;
  norwState.secondsLeft--;

  // 10-second warning
  if (norwState.secondsLeft === 10) {
    norwPlayWarning();
    norwVibrate([100]);
  }

  if (norwState.secondsLeft <= 0) {
    norwFinishInterval();
    return;
  }

  norwRenderRunning();
}

function norwFinishInterval() {
  // Save current interval
  const iv = norwState.currentInterval;
  iv.endTime = Date.now();
  norwState.intervals.push(iv);

  if (norwState.phase === 'work') {
    // Transition to recovery
    norwState.phase = 'recovery';
    norwState.secondsLeft = norwState.recoveryDuration;
    norwState.currentInterval = norwNewInterval('recovery', norwState.currentCycle);
    norwPlayRecover();
    norwVibrate([200, 100, 200]);
  } else {
    // End of recovery — check if more cycles
    if (norwState.currentCycle >= norwState.cycles) {
      // Session complete
      norwFinishSession();
      return;
    }
    // Next cycle
    norwState.currentCycle++;
    norwState.phase = 'work';
    norwState.secondsLeft = norwState.workDuration;
    norwState.currentInterval = norwNewInterval('work', norwState.currentCycle);
    norwPlayGo();
    norwVibrate([200, 100, 200]);
  }

  // Flash the screen
  const runScreen = document.getElementById('screen-norw-running');
  if (runScreen) {
    runScreen.classList.add('norw-flash');
    setTimeout(() => runScreen.classList.remove('norw-flash'), 500);
  }

  norwRenderRunning();
}

function norwStop() {
  if (!confirm('Stop the run? Data for the current interval will be lost.')) return;
  // Save current interval if it has data
  const iv = norwState.currentInterval;
  if (iv && iv.hrSamples.length > 0) {
    iv.endTime = Date.now();
    iv.duration = Math.round((iv.endTime - iv.startTime) / 1000);
    norwState.intervals.push(iv);
  }
  norwFinishSession();
}

function norwFinishSession() {
  norwState.running = false;
  clearInterval(norwState.timerInterval);
  norwStopGPS();
  norwReleaseWakeLock();
  norwRenderSummary();
  showScreen('norw-summary');

  // Auto-sync to Supabase
  const session = norwBuildSession();
  norwSaveToLocalStorage(session);
  norwSyncToSupabase(session);
}

function norwRenderRunning() {
  const phaseEl = document.getElementById('norw-phase');
  const countEl = document.getElementById('norw-countdown');
  const cycleEl = document.getElementById('norw-cycle');

  if (phaseEl) {
    phaseEl.textContent = norwState.phase === 'work' ? 'WORK' : 'RECOVER';
    phaseEl.className = 'norw-phase ' + (norwState.phase === 'work' ? 'work' : 'recover');
  }
  if (countEl) {
    const m = Math.floor(norwState.secondsLeft / 60);
    const s = norwState.secondsLeft % 60;
    countEl.textContent = m + ':' + s.toString().padStart(2, '0');
  }
  if (cycleEl) {
    cycleEl.textContent = `Cycle ${norwState.currentCycle} of ${norwState.cycles}`;
  }
  norwUpdateMetrics();
}

async function norwRequestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      norwState.wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (e) { /* wake lock not available */ }
}

function norwReleaseWakeLock() {
  if (norwState.wakeLock) {
    norwState.wakeLock.release();
    norwState.wakeLock = null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add Norwegian interval timer core logic"
```

---

### Task 8: JS — Session Builder, Summary Renderer, and Supabase Sync

**Files:**
- Modify: `index.html` (JS section, after Task 7's code)

- [ ] **Step 1: Add session data builder**

```javascript
// ── Session Data ──────────────────────────────────────────────
function norwBuildInterval(iv) {
  const samples = iv.hrSamples;
  const hrData = samples.length > 0 ? {
    avg: Math.round(samples.reduce((a, b) => a + b, 0) / samples.length),
    min: Math.min(...samples),
    max: Math.max(...samples),
    samples: samples,
  } : { avg: 0, min: 0, max: 0, samples: [] };

  const durationSec = iv.endTime ? Math.round((iv.endTime - iv.startTime) / 1000) : iv.duration;
  const paceSecPerKm = iv.distance > 0.01 ? durationSec / iv.distance : null;

  return {
    phase: iv.phase,
    cycle: iv.cycle,
    duration: durationSec,
    hr: hrData,
    distance_km: Math.round(iv.distance * 1000) / 1000,
    pace_avg: norwFormatPace(paceSecPerKm),
    elevation: {
      gain_m: Math.round(iv.elevGain),
      loss_m: Math.round(iv.elevLoss),
    },
  };
}

function norwBuildSession() {
  const intervals = norwState.intervals.map(norwBuildInterval);
  const allSamples = intervals.flatMap(iv => iv.hr.samples);
  const totalDist = intervals.reduce((sum, iv) => sum + iv.distance_km, 0);
  const totalDuration = intervals.reduce((sum, iv) => sum + iv.duration, 0);
  const totalElevGain = intervals.reduce((sum, iv) => sum + iv.elevation.gain_m, 0);
  const totalElevLoss = intervals.reduce((sum, iv) => sum + iv.elevation.loss_m, 0);

  // Time in each zone
  const zoneTime = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 };
  intervals.forEach(iv => {
    iv.hr.samples.forEach(hr => {
      const z = norwGetZone(hr, norwState.restingHR);
      if (z) zoneTime['z' + z]++;
    });
  });

  const avgPaceSecPerKm = totalDist > 0.01 ? totalDuration / totalDist : null;

  const now = new Date();
  return {
    type: 'norwegian_4x4',
    date: now.toISOString(),
    dateLocal: now.toISOString().slice(0, 10),
    duration_seconds: totalDuration,
    config: {
      maxHR: NORW_MAX_HR,
      restingHR: norwState.restingHR,
      workDuration: norwState.workDuration,
      recoveryDuration: norwState.recoveryDuration,
      cycles: norwState.cycles,
    },
    intervals,
    totals: {
      distance_km: Math.round(totalDist * 1000) / 1000,
      avg_pace: norwFormatPace(avgPaceSecPerKm),
      avg_hr: allSamples.length > 0 ? Math.round(allSamples.reduce((a, b) => a + b, 0) / allSamples.length) : 0,
      max_hr: allSamples.length > 0 ? Math.max(...allSamples) : 0,
      time_in_zone_seconds: zoneTime,
      elevation: { gain_m: Math.round(totalElevGain), loss_m: Math.round(totalElevLoss) },
    },
  };
}
```

- [ ] **Step 2: Add summary renderer**

```javascript
// ── Summary Renderer ──────────────────────────────────────────
function norwRenderSummary() {
  const session = norwBuildSession();

  // Duration
  const durEl = document.getElementById('norw-sum-duration');
  if (durEl) {
    const m = Math.floor(session.duration_seconds / 60);
    const s = session.duration_seconds % 60;
    durEl.textContent = m + ':' + s.toString().padStart(2, '0');
  }

  // Interval cards
  const container = document.getElementById('norw-sum-intervals');
  if (container) {
    let html = '';
    session.intervals.forEach(iv => {
      const isWork = iv.phase === 'work';
      html += `
        <div class="norw-interval-card ${isWork ? 'work' : 'recovery'}">
          <div class="norw-interval-header">
            <span class="norw-interval-phase" style="color:${isWork ? 'var(--red)' : 'var(--green)'}">
              ${isWork ? 'WORK' : 'RECOVER'} — Cycle ${iv.cycle}
            </span>
            <span style="font-size:12px;color:var(--text-dim)">${Math.floor(iv.duration / 60)}:${(iv.duration % 60).toString().padStart(2, '0')}</span>
          </div>
          <div class="norw-interval-grid">
            <div class="norw-interval-stat">Avg HR<span>${iv.hr.avg || '--'}</span></div>
            <div class="norw-interval-stat">Max HR<span>${iv.hr.max || '--'}</span></div>
            <div class="norw-interval-stat">Dist<span>${iv.distance_km.toFixed(2)} km</span></div>
            <div class="norw-interval-stat">Pace<span>${iv.pace_avg}</span></div>
            <div class="norw-interval-stat">↑ Elev<span>${iv.elevation.gain_m} m</span></div>
            <div class="norw-interval-stat">↓ Elev<span>${iv.elevation.loss_m} m</span></div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  // Zone bar
  const zoneBar = document.getElementById('norw-zone-bar');
  if (zoneBar) {
    const zt = session.totals.time_in_zone_seconds;
    const total = zt.z1 + zt.z2 + zt.z3 + zt.z4 + zt.z5;
    if (total > 0) {
      zoneBar.innerHTML = [1, 2, 3, 4, 5].map(z => {
        const pct = (zt['z' + z] / total * 100).toFixed(1);
        const mins = Math.floor(zt['z' + z] / 60);
        const secs = zt['z' + z] % 60;
        return pct > 0
          ? `<div style="width:${pct}%;background:${NORW_ZONE_COLORS[z]}" title="Z${z}: ${mins}:${secs.toString().padStart(2, '0')}"></div>`
          : '';
      }).join('');
    }
  }

  // Totals
  const totalsEl = document.getElementById('norw-sum-totals');
  if (totalsEl) {
    const t = session.totals;
    totalsEl.innerHTML = `
      <div class="norw-totals-grid">
        <div class="norw-interval-stat">Distance<span>${t.distance_km.toFixed(2)} km</span></div>
        <div class="norw-interval-stat">Avg Pace<span>${t.avg_pace}</span></div>
        <div class="norw-interval-stat">Avg HR<span>${t.avg_hr} bpm</span></div>
        <div class="norw-interval-stat">Max HR<span>${t.max_hr} bpm</span></div>
        <div class="norw-interval-stat">↑ Elevation<span>${t.elevation.gain_m} m</span></div>
        <div class="norw-interval-stat">↓ Elevation<span>${t.elevation.loss_m} m</span></div>
      </div>
    `;
  }
}
```

- [ ] **Step 3: Add localStorage save and Supabase sync**

```javascript
// ── Persistence ───────────────────────────────────────────────
function norwSaveToLocalStorage(session) {
  const history = JSON.parse(localStorage.getItem('norwegian_history') || '[]');
  history.unshift(session);
  localStorage.setItem('norwegian_history', JSON.stringify(history));
}

async function norwSyncToSupabase(session) {
  const statusEl = document.getElementById('norw-sync-status');
  const setStatus = (msg, color) => { if (statusEl) statusEl.innerHTML = `<span style="color:${color}">${msg}</span>`; };
  setStatus('⏳ Syncing...', '#f59e0b');
  try {
    const row = {
      date_local: session.dateLocal,
      date_iso: session.date,
      template_id: 'norwegian_4x4',
      template_name: 'Norwegian 4x4',
      duration_seconds: session.duration_seconds,
      readiness: null,
      exercises: JSON.stringify(session.intervals),
      total_sets_logged: session.intervals.length,
    };
    const res = await fetch(`${SB_URL}/${WO_TABLE}`, {
      method: 'POST',
      headers: sbHeaders({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Norwegian sync error:', res.status, err);
      setStatus('⚠️ ' + (err || res.statusText), '#ef4444');
      return;
    }
    setStatus('✅ Synced to Supabase', '#10b981');
  } catch (err) {
    console.error('Norwegian sync error:', err);
    setStatus('⚠️ ' + (err.message || String(err)), '#ef4444');
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add session builder, summary renderer, Supabase sync"
```

---

### Task 9: JS — CSV and JSON Export

**Files:**
- Modify: `index.html` (JS section, after Task 8's code)

- [ ] **Step 1: Add export functions**

```javascript
// ── Export ─────────────────────────────────────────────────────
function norwExportCSV() {
  const session = norwBuildSession();
  const headers = ['cycle', 'phase', 'duration_sec', 'avg_hr', 'min_hr', 'max_hr', 'distance_km', 'pace', 'elevation_gain_m', 'elevation_loss_m'];
  const rows = session.intervals.map(iv => [
    iv.cycle, iv.phase, iv.duration, iv.hr.avg, iv.hr.min, iv.hr.max,
    iv.distance_km.toFixed(3), iv.pace_avg, iv.elevation.gain_m, iv.elevation.loss_m,
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `norwegian_4x4_${session.dateLocal}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('CSV downloaded!');
}

function norwExportJSON() {
  const session = norwBuildSession();
  downloadJSON(session, `norwegian_4x4_${session.dateLocal}.json`);
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add CSV and JSON export for Norwegian sessions"
```

---

### Task 10: JS — Home Screen Card, Cleanup, and Integration

**Files:**
- Modify: `index.html` (JS section — `renderHome()`, `cleanup()`, `showScreen()`)

- [ ] **Step 1: Add Norwegian card to home screen**

In the `renderHome()` function, find the line that sets `flexContainer.innerHTML = flexHtml;` (~line 981). After that block (after the closing `}` of the `if (flexContainer && flexTemplates.length)` block at ~line 982), insert:

```javascript
  // Norwegian 4x4 card — always visible
  const norwCard = document.createElement('div');
  norwCard.style.marginTop = '20px';
  norwCard.innerHTML = `
    <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Cardio</div>
    <div class="workout-card" onclick="showScreen('norwegian')" style="border-color:var(--red);">
      <div class="wc-day" style="background:var(--red-dim);color:var(--red);font-size:16px;">🏃</div>
      <div class="wc-info">
        <div class="wc-title">Norwegian 4×4</div>
        <div class="wc-desc">4 min work · 3 min recovery · 4 cycles</div>
      </div>
      <div class="wc-arrow">›</div>
    </div>
  `;
  document.getElementById('workout-cards').parentElement.appendChild(norwCard);
```

- [ ] **Step 2: Extend cleanup() for Norwegian timers**

Find the `cleanup()` function (~line 1632). Add Norwegian cleanup at the end, before the closing `}`:

```javascript
  // Norwegian cleanup
  norwCleanup();
```

- [ ] **Step 3: Add norwCleanup function**

Add this near the other Norwegian JS code:

```javascript
function norwCleanup() {
  norwState.running = false;
  clearInterval(norwState.timerInterval);
  norwStopGPS();
  norwReleaseWakeLock();
  if (norwState.btDevice && norwState.btDevice.gatt && norwState.btDevice.gatt.connected) {
    try {
      if (norwState.btCharacteristic) {
        norwState.btCharacteristic.stopNotifications();
      }
    } catch (e) { /* ignore */ }
  }
  norwState.currentHR = null;
  norwState.hrConnected = false;
  norwState.currentInterval = null;
}
```

- [ ] **Step 4: Extend beforeunload warning**

Find the `beforeunload` event listener (~line 1700). Change the condition to also check for an active Norwegian session:

```javascript
window.addEventListener('beforeunload', (e) => {
  if ((state.activeTemplate && state.startTime) || norwState.running) {
    e.preventDefault();
  }
});
```

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: integrate Norwegian 4x4 into home screen, cleanup, and navigation"
```

---

### Task 11: Manual Test on Device

- [ ] **Step 1: Serve locally and test on Pixel 7**

```bash
cd /Users/tylerwoychyshyn/fitness
python3 -m http.server 8080
```

Open `http://<your-local-ip>:8080` on your Pixel 7 in Chrome.

- [ ] **Step 2: Test the full flow**

1. Verify "Norwegian 4×4" card appears on home screen below workout cards
2. Tap it — verify setup screen loads with defaults (4/3/4/60)
3. Tap "Connect Polar H10" — verify Bluetooth picker appears and connects
4. Tap "START RUN" — verify:
   - Timer counts down from 4:00
   - HR updates live
   - GPS distance/pace/elevation update
   - Phase shows "WORK" in red
5. Wait for transition — verify:
   - Audio tone plays (ascending for work, descending for recover)
   - Phone vibrates
   - Screen flashes
   - Phase switches to "RECOVER" in green
   - Timer resets to 3:00
6. After all cycles — verify:
   - Summary screen shows per-interval cards with HR/distance/pace/elevation
   - Zone bar renders
   - Totals section shows aggregated data
   - "Synced to Supabase" message appears
7. Test CSV/JSON export buttons
8. Test STOP button mid-run
9. Test back button returns to home
10. Test screen stays awake during run

- [ ] **Step 3: Fix any issues found and commit**

```bash
git add index.html
git commit -m "fix: address issues from manual device testing"
```

- [ ] **Step 4: Deploy**

```bash
git push
```

Vercel auto-deploys from push.
