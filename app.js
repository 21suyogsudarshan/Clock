// ==========================================
// FORGE CLOCK: CORE LOGIC & 100 TONES ENGINE
// ==========================================

// Global Alarm State
let activeAlarmTime = null;
let activeAlarmTone = 1;

// Initialize 100 Tones in Dropdown
const alarmSoundSelect = document.getElementById("alarmSoundSelect");
if (alarmSoundSelect) {
  for (let i = 1; i <= 100; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `Tone #${i} ${i % 2 === 0 ? "⚡ Synth Pulse" : "🔔 Classic Beep"}`;
    alarmSoundSelect.appendChild(opt);
  }
}

// 1. Play Synthesized Alarm Tone (Web Audio API)
function playAlarmSound(soundIndex = 1) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const baseFreq = 220 + ((soundIndex - 1) * 12);
  const waveTypes = ["sine", "square", "sawtooth", "triangle"];
  const waveType = waveTypes[(soundIndex - 1) % 4];
  const speedMs = 120 + ((soundIndex % 5) * 40);

  let pulseCount = 0;
  const maxPulses = 12;

  const interval = setInterval(() => {
    if (pulseCount >= maxPulses) {
      clearInterval(interval);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveType;
    const pitchOffset = (pulseCount % 2 === 0) ? 0 : ((soundIndex % 7) * 35);
    osc.frequency.setValueAtTime(baseFreq + pitchOffset, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);

    pulseCount++;
  }, speedMs);
}

// 2. Trigger Device Vibration
function triggerVibration() {
  if ("vibrate" in navigator) {
    navigator.vibrate([500, 250, 500, 250, 500, 250, 500]);
  }
}

// 3. Combined Alarm Trigger Routine
function fireAlarm(soundNumber) {
  playAlarmSound(soundNumber);
  triggerVibration();
}

// Live Clock Interval
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  document.getElementById("liveClock").textContent = `${hours}:${minutes}:${seconds}`;

  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  document.getElementById("liveDate").textContent = now.toLocaleDateString(undefined, options);

  // Check Alarm
  const currentTimeString = `${hours}:${minutes}`;
  if (activeAlarmTime && currentTimeString === activeAlarmTime && seconds === "00") {
    fireAlarm(activeAlarmTone);
    alert(`⏰ Forge Clock Alarm Ringing! (Tone #${activeAlarmTone})`);
  }
}
setInterval(updateClock, 1000);
updateClock();

// Alarm UI Event Listeners
document.getElementById("setAlarmBtn").addEventListener("click", () => {
  const timeInput = document.getElementById("alarmTime").value;
  if (!timeInput) {
    alert("Please select a valid time!");
    return;
  }
  activeAlarmTime = timeInput;
  activeAlarmTone = parseInt(document.getElementById("alarmSoundSelect").value, 10);
  document.getElementById("alarmStatus").textContent = `Active Alarm: ${activeAlarmTime} (Tone #${activeAlarmTone})`;
});

document.getElementById("testSoundBtn").addEventListener("click", () => {
  const selectedTone = parseInt(document.getElementById("alarmSoundSelect").value, 10);
  fireAlarm(selectedTone);
});

// Unlock Web Audio Context on first interaction
document.addEventListener("click", () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    const ctx = new AudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
  }
}, { once: true });

// Stopwatch Engine
let swTimer = null;
let swElapsedTime = 0;

const swDisplay = document.getElementById("swDisplay");
const swStartBtn = document.getElementById("swStartBtn");
const swLapBtn = document.getElementById("swLapBtn");
const swResetBtn = document.getElementById("swResetBtn");
const swLaps = document.getElementById("swLaps");

function formatSWTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  const hundredths = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");
  return `${minutes}:${seconds}.${hundredths}`;
}

swStartBtn.addEventListener("click", () => {
  if (swTimer) {
    clearInterval(swTimer);
    swTimer = null;
    swStartBtn.textContent = "Start";
    swLapBtn.disabled = true;
  } else {
    const startTime = Date.now() - swElapsedTime;
    swTimer = setInterval(() => {
      swElapsedTime = Date.now() - startTime;
      swDisplay.textContent = formatSWTime(swElapsedTime);
    }, 10);
    swStartBtn.textContent = "Pause";
    swLapBtn.disabled = false;
    swResetBtn.disabled = false;
  }
});

swLapBtn.addEventListener("click", () => {
  const li = document.createElement("li");
  li.innerHTML = `<span>Lap ${swLaps.children.length + 1}</span><strong>${formatSWTime(swElapsedTime)}</strong>`;
  swLaps.prepend(li);
});

swResetBtn.addEventListener("click", () => {
  clearInterval(swTimer);
  swTimer = null;
  swElapsedTime = 0;
  swDisplay.textContent = "00:00.00";
  swStartBtn.textContent = "Start";
  swLapBtn.disabled = true;
  swResetBtn.disabled = true;
  swLaps.innerHTML = "";
});