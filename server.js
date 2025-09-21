const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config(); // load .env early

// Env
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = process.env.CITY || 'Springboro';
const STATE = process.env.STATE || 'OH';
const COUNTRY = process.env.COUNTRY || 'US';
const DEFAULT_UNITS = (process.env.UNITS || 'imperial').toLowerCase(); // standard|metric|imperial

// Basic validation
if (!API_KEY) {
  console.warn('[WARN] OPENWEATHER_API_KEY is not set. /api will return 500 until you configure it.');
}

// Serve static assets from repo root
app.use(express.static(__dirname));

// Root -> index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * GET /api
 * Proxies OpenWeather Current Weather Data.
 * - Supports either city/state/country OR lat/lon query params.
 * - Query overrides: ?units=metric|imperial|standard
 * - Example: /api?city=Cincinnati&state=OH&country=US&units=metric
 * - Example: /api?lat=39.10&lon=-84.51
 */
app.get('/api', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: missing OPENWEATHER_API_KEY' });
  }

  try {
    const { city, state, country, lat, lon } = req.query;
    const units = (req.query.units || DEFAULT_UNITS).toLowerCase();

    let url;
    if (lat && lon) {
      // Coordinate-based query
      const latNum = Number(lat);
      const lonNum = Number(lon);
      if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
        return res.status(400).json({ error: 'Invalid lat/lon' });
      }
      const u = new URL('https://api.openweathermap.org/data/2.5/weather');
      u.searchParams.set('lat', latNum.toString());
      u.searchParams.set('lon', lonNum.toString());
      u.searchParams.set('appid', API_KEY);
      u.searchParams.set('units', units);
      url = u.toString();
    } else {
      // City/state/country query
      const qCity = (city || CITY).trim();
      const qState = (state || STATE).trim();
      const qCountry = (country || COUNTRY).trim();
      const query = `${qCity}, ${qState}, ${qCountry}`;
      const u = new URL('https://api.openweathermap.org/data/2.5/weather');
      u.searchParams.set('q', query);
      u.searchParams.set('appid', API_KEY);
      u.searchParams.set('units', units);
      url = u.toString();
    }

    const response = await fetch(url);
    if (!response.ok) {
      // Pass through OpenWeather error body if available
      const text = await response.text();
      return res.status(response.status).type('application/json').send(text);
    }
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('Error fetching OpenWeather:', err);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
