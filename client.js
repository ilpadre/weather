document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('f');
  const city = document.getElementById('city');
  const state = document.getElementById('state');
  const out = document.getElementById('out');
  const unitsSel = document.getElementById('units');

  async function getWeather(c, s, units) {
    const url = new URL('/api', window.location.origin);
    url.searchParams.set('city', c);
    url.searchParams.set('state', s);
    if (units) url.searchParams.set('units', units);
    const r = await fetch(url);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    out.textContent = 'Loading…';
    try {
      const data = await getWeather(city.value, state.value, unitsSel.value);
      out.innerHTML = `
        <div><b>Description:</b> ${data?.weather?.[0]?.main ?? '—'}</div>
        <div><b>Temperature:</b> ${data?.main?.temp ?? '—'}</div>
        <div><b>Feels Like:</b> ${data?.main?.feels_like ?? '—'}</div>
      `;
    } catch (err) {
      out.textContent = err.message || 'Failed to fetch';
    }
  });

  // Optional: demo load using defaults you type into the form
  form.dispatchEvent(new Event('submit'));
});
