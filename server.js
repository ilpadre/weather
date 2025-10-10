const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// serve the two static files we need
app.use(express.static(__dirname));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Minimal API: city + state (country fixed to US)
app.get('/api', async (req, res) => {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing OPENWEATHER_API_KEY' });
  }

  const city = (req.query.city || '').trim();
  const state = (req.query.state || '').trim();
  const units = (req.query.units || 'imperial').toLowerCase(); // standard | metric | imperial

  if (!city || !state) {
    return res.status(400).json({ error: 'Please provide ?city=<name>&state=<abbr>' });
  }

  try {
    const u = new URL('https://api.openweathermap.org/data/2.5/weather');
    u.searchParams.set('q', `${city}, ${state}, US`); // teaching version: country fixed to US
    u.searchParams.set('appid', API_KEY);
    u.searchParams.set('units', units);

    const resp = await fetch(u);
    const text = await resp.text(); // pass-through body
    res.status(resp.status).type('application/json').send(text);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
