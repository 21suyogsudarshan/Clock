// Function to play synthesized alarm beep using Web Audio API
function playAlarmSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  let beepCount = 0;

  // Beep sequence: 4 quick double-beeps
  const interval = setInterval(() => {
    if (beepCount >= 8) {
      clearInterval(interval);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Pitch (880 Hz = A5 note)

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);

    beepCount++;
  }, 300);
}
// Example check inside your clock interval
if (currentHoursMinutes === alarmTime) {
  playAlarmSound();
  alert("⏰ Alarm Ringing!");
}
document.addEventListener('click', () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }
}, { once: true });