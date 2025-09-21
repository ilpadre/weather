document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('weather-form');
    const statusEl = document.getElementById('status');
    const card = document.getElementById('card');
    const icon = document.getElementById('icon');
    const place = document.getElementById('place');
    const desc = document.getElementById('desc');
    const temp = document.getElementById('temp');
    const feels = document.getElementById('feels');
    const humidity = document.getElementById('humidity');
    const wind = document.getElementById('wind');
    const raw = document.getElementById('raw');
  
    async function fetchWeather(params = {}) {
      const url = new URL('/api', window.location.origin);
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          url.searchParams.set(k, v);
        }
      });
      const resp = await fetch(url);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text}`);
      }
      return await resp.json();
    }
  
    function showStatus(msg, kind = 'info') {
      statusEl.hidden = false;
      statusEl.textContent = msg;
      statusEl.className = `status ${kind}`;
    }
  
    function clearStatus() {
      statusEl.hidden = true;
      statusEl.textContent = '';
      statusEl.className = 'status';
    }
  
    function render(data) {
      // Derive display fields
      const city = data?.name ?? '';
      const country = data?.sys?.country ?? '';
      place.textContent = [city, country].filter(Boolean).join(', ');
  
      const w = data?.weather?.[0];
      desc.textContent = w?.description ? capitalize(w.description) : (w?.main ?? '—');
      const iconCode = w?.icon;
      if (iconCode) {
        icon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        icon.alt = w?.description || w?.main || 'Weather Icon';
        icon.hidden = false;
      } else {
        icon.hidden = true;
      }
  
      const u = guessUnits(data);
      temp.textContent = fmtNum(data?.main?.temp) + (u ? ` ${u}` : '');
      feels.textContent = fmtNum(data?.main?.feels_like) + (u ? ` ${u}` : '');
      humidity.textContent = (data?.main?.humidity ?? '—') + '%';
      wind.textContent = `${fmtNum(data?.wind?.speed)} ${u === '°F' || u === '°C' ? 'm/s' : ''}`;
  
      raw.textContent = JSON.stringify(data, null, 2);
      card.hidden = false;
    }
  
    function fmtNum(x) {
      return (typeof x === 'number' && Number.isFinite(x)) ? x.toFixed(1) : '—';
    }
  
    function capitalize(s) {
      return (s || '').slice(0,1).toUpperCase() + (s || '').slice(1);
    }
  
    function guessUnits(data) {
      const t = data?.main?.temp;
      if (typeof t !== 'number') return '';
      if (t > 200) return 'K';
      return t > 45 ? '°F' : '°C';
    }
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearStatus();
      card.hidden = true;
  
      const params = {
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        country: document.getElementById('country').value,
        lat: document.getElementById('lat').value,
        lon: document.getElementById('lon').value,
        units: document.getElementById('units').value
      };
  
      if (params.lat && params.lon) {
        delete params.city; delete params.state; delete params.country;
      }
  
      try {
        showStatus('Loading…');
        const data = await fetchWeather(params);
        clearStatus();
        render(data);
      } catch (err) {
        showStatus(err.message || 'Failed to fetch data', 'error');
      }
    });
  
    (async () => {
      try {
        showStatus('Loading…');
        const data = await fetchWeather({});
        clearStatus();
        render(data);
      } catch (err) {
        showStatus('Configure your API key in .env, then restart the server.', 'error');
      }
    })();
  });
  