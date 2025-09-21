# Weather Monitor — Web + CLI

A tiny Node/Express app that calls the OpenWeather **Current Weather Data** API and returns current conditions. It serves a simple web page and also supports a CLI mode that prints the same data to the terminal.

## Features

- Web UI at `http://localhost:3001/` (shows description, temperature, and “feels like”).  
- REST endpoint `GET /api` proxies OpenWeather and returns JSON.  
- CLI script prints a friendly summary to stdout.

## Project structure

```
.
├── server.js         # Express server; serves index.html and /api proxy
├── index.html        # Minimal web page shell
├── client.js         # Fetches /api and renders to the page
├── cli-client.js     # CLI script that hits http://localhost:3001/api
├── .env.example      # Template for env vars (copy to .env)
├── .gitignore
└── package.json
```

## Requirements

- **Node.js 18+** (includes built‑in `fetch`; stable as of Node 21).
- **npm** (to install Express and dotenv).

## Setup

1) Install dependencies
```bash
npm install
```

2) Configure environment  
Copy `.env.example` to `.env` and set your values:

```ini
OPENWEATHER_API_KEY=YOUR_KEY_HERE
CITY=Springboro
STATE=OH
COUNTRY=US
UNITS=imperial   # standard | metric | imperial
PORT=3001
```

> OpenWeather supports `units=standard|metric|imperial`. If omitted, `standard` (Kelvin) is used.

## Run

Start the server:
```bash
npm start
```

Open the web UI:
```
http://localhost:3001/
```

CLI (with the server running):
```bash
npm run cli
```

You should see output like:
```
What's it like outside?
Description: Clear
Temperature: 72
Feels Like: 70
```

## API

**GET `/api`** → Returns JSON from OpenWeather Current Weather Data. Supports either:
- `?city=<name>&state=<abbr>&country=<code>&units=<units>` (defaults come from `.env`)
- or `?lat=<lat>&lon=<lon>&units=<units>`

Examples:
```
/api?city=Cincinnati&state=OH&country=US&units=metric
/api?lat=39.10&lon=-84.51
```

## Security notes

- Do **not** commit real API keys—keep them in `.env` (or a secrets manager in production).
- The browser calls your server (`/api`); the API key stays on the server.

## Troubleshooting

- **`fetch is not defined` in Node:** Ensure Node 18+ (and ideally 21+ for stable fetch).
- **401 from OpenWeather:** Check `OPENWEATHER_API_KEY`, plan/limits, and query details.
- **Wrong units:** Set `UNITS` in `.env` or pass `?units=metric|imperial|standard`.

## License

MIT
