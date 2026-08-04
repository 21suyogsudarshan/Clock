function updateClock() {
  const now = new Date();

  // Local Time & Date
  document.getElementById('localTime').textContent = now.toLocaleTimeString('en-US', {
    hour12: false
  });

  document.getElementById('localDate').textContent = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // World Timezones
  const cities = {
    nyTime: 'America/New_York',
    londonTime: 'Europe/London',
    tokyoTime: 'Asia/Tokyo'
  };

  for (const [elementId, timeZone] of Object.entries(cities)) {
    document.getElementById(elementId).textContent = now.toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}

setInterval(updateClock, 1000);
updateClock();