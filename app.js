// Register Service Worker for Offline PWA Support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// ---------------------------------------------------------
// 1. 50+ THEME ENGINE GENERATOR
// ---------------------------------------------------------
const themeSelector = document.getElementById('themeSelector');
const baseHues = [0, 15, 30, 45, 60, 90, 120, 150, 180, 200, 220, 240, 260, 280, 300, 320, 340];
const themes = [];

let count = 1;
// Generate 50 unique dynamic theme color variations
baseHues.forEach(hue => {
  ['Dark', 'OLED', 'Neon'].forEach(mode => {
    if (themes.length < 50) {
      themes.push({
        id: `theme-${count}`,
        name: `${mode} ${hue}° Hue (#${count})`,
        bg: mode === 'OLED' ? '#000000' : `hsl(${hue}, 30%, ${mode === 'Neon' ? '8%' : '12%'})`,
        accent: `hsl(${hue}, 90%, 60%)`,
        text: '#ffffff'
      });
      count++;
    }
  });
});

themes.forEach(t => {
  const opt = document.createElement('option');
  opt.value = t.id;
  opt.textContent = t.name;
  themeSelector.appendChild(opt);
});

themeSelector.addEventListener('change', (e) => {
  const selected = themes.find(t => t.id === e.target.value);
  if (selected) {
    document.documentElement.style.setProperty('--bg', selected.bg);
    document.documentElement.style.setProperty('--accent', selected.accent);
    document.documentElement.style.setProperty('--text', selected.text);
    localStorage.setItem('savedTheme', selected.id);
  }
});

// Restore saved theme
const savedThemeId = localStorage.getItem('savedTheme');
if (savedThemeId) {
  themeSelector.value = savedThemeId;
  themeSelector.dispatchEvent(new Event('change'));
}

// ---------------------------------------------------------
// 2. TABS NAVIGATION
// ---------------------------------------------------------
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ---------------------------------------------------------
// 3. WORLD CLOCK & SEARCH 400+ TIMEZONES
// ---------------------------------------------------------
const allTimezones = Intl.supportedValuesOf('timeZone'); // Native browser DB of all 400+ IANA zones
let favorites = JSON.parse(localStorage.getItem('favTimezones')) || ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

function updateWorldClock() {
  const now = new Date();
  document.getElementById('localTime').textContent = now.toLocaleTimeString('en-US', { hour12: false });
  document.getElementById('localDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  const favsContainer = document.getElementById('favoritesList');
  favsContainer.innerHTML = '';

  favorites.forEach(zone => {
    const timeString = now.toLocaleTimeString('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false });
    const cityName = zone.split('/').pop().replace('_', ' ');

    const row = document.createElement('div');
    row.className = 'clock-row';
    row.innerHTML = `
      <div>
        <strong>${cityName}</strong>
        <div style="font-size:0.75rem; opacity:0.6">${zone}</div>
      </div>
      <div style="font-size:1.25rem; font-weight:bold; color:var(--accent)">${timeString}</div>
      <button class="btn danger" style="padding:4px 8px;" onclick="removeFavorite('${zone}')">✕</button>
    `;
    favsContainer.appendChild(row);
  });
}

window.removeFavorite = function(zone) {
  favorites = favorites.filter(f => f !== zone);
  localStorage.setItem('favTimezones', JSON.stringify(favorites));
  updateWorldClock();
};

const citySearch = document.getElementById('citySearch');
const searchResults = document.getElementById('searchResults');

citySearch.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    searchResults.classList.add('hidden');
    return;
  }

  const matches = allTimezones.filter(z => z.toLowerCase().includes(query)).slice(0, 10);
  searchResults.innerHTML = '';
  
  if (matches.length > 0) {
    searchResults.classList.remove('hidden');
    matches.forEach(zone => {
      const item = document.createElement('div');
      item.className = 'search-item';
      item.textContent = zone;
      item.onclick = () => {
        if (!favorites.includes(zone)) {
          favorites.push(zone);
          localStorage.setItem('favTimezones', JSON.stringify(favorites));
          updateWorldClock();
        }
        citySearch.value = '';
        searchResults.classList.add('hidden');
      };
      searchResults.appendChild(item);
    });
  } else {
    searchResults.classList.add('hidden');
  }
});

setInterval(updateWorldClock, 1000);
updateWorldClock();

// ---------------------------------------------------------
// 4. ALARM SYSTEM
// ---------------------------------------------------------
let alarms = JSON.parse(localStorage.getItem('savedAlarms')) || [];

function renderAlarms() {
  const list = document.getElementById('alarmsList');
  list.innerHTML = '';
  alarms.forEach((alarm, index) => {
    const item = document.createElement('div');
    item.className = 'clock-row';
    item.innerHTML = `
      <div>
        <strong>${alarm.time}</strong> - ${alarm.label || 'Alarm'}
      </div>
      <button class="btn danger" onclick="deleteAlarm(${index})">Delete</button>
    `;
    list.appendChild(item);
  });
}

document.getElementById('addAlarmBtn').addEventListener('click', () => {
  const time = document.getElementById('alarmTime').value;
  const label = document.getElementById('alarmLabel').value;
  if (time) {
    alarms.push({ time, label });
    localStorage.setItem('savedAlarms', JSON.stringify(alarms));
    renderAlarms();
    document.getElementById('alarmTime').value = '';
    document.getElementById('alarmLabel').value = '';
  }
});

window.deleteAlarm = function(index) {
  alarms.splice(index, 1);
  localStorage.setItem('savedAlarms', JSON.stringify(alarms));
  renderAlarms();
};

// Alarm Trigger Check
setInterval(() => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  alarms.forEach(alarm => {
    if (alarm.time === currentTime && now.getSeconds() === 0) {
      alert(`⏰ ALARM: ${alarm.label || 'Time is up!'}`);
    }
  });
}, 1000);

renderAlarms();

// ---------------------------------------------------------
// 5. STOPWATCH SYSTEM
// ---------------------------------------------------------
let swTimer = null;
let swStartTime = 0;
let swElapsedTime = 0;

const swDisplay = document.getElementById('swDisplay');
const swStartBtn = document.getElementById('swStartBtn');
const swLapBtn = document.getElementById('swLapBtn');
const swResetBtn = document.getElementById('swResetBtn');
const swLaps = document.getElementById('swLaps');

function formatSWTime(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const millis = Math.floor((ms % 1000) / 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
}

swStartBtn.addEventListener('click', () => {
  if (swTimer) {
    // Pause
    clearInterval(swTimer);
    swTimer = null;
    swStartBtn.textContent = 'Start';
    swLapBtn.disabled = true;
  } else {
    // Start
    swStartTime = Date.now() - swElapsedTime;
    swTimer = setInterval(() => {
      swElapsedTime = Date.now() - swStartTime;
      swDisplay.textContent = formatSWTime(swElapsedTime);
    }, 10);
    swStartBtn.textContent = 'Pause';
    swLapBtn.disabled = false;
    swResetBtn.disabled = false;
  }
});

swLapBtn.addEventListener('click', () => {
  const li = document.createElement('li');
  li.innerHTML = `<span>Lap ${swLaps.children.length + 1}</span> <strong>${formatSWTime(swElapsedTime)}</strong>`;
  swLaps.prepend(li);
});

swResetBtn.addEventListener('click', () => {
  clearInterval(swTimer);
  swTimer = null;
  swElapsedTime = 0;
  swDisplay.textContent = '00:00.00';
  swStartBtn.textContent = 'Start';
  swLapBtn.disabled = true;
  swResetBtn.disabled = true;
  swLaps.innerHTML = '';
});