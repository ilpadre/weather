#!/usr/bin/env node
/**
 * Simple CLI for the Weather Monitor teaching app.
 * Usage:
 *   node cli-client.js --city "Cincinnati" --state OH [--units imperial]
 *   node cli-client.js -c Cincinnati -s OH -u metric
 *   node cli-client.js "Cincinnati" "OH"
 *
 * Flags:
 *   -c, --city   City name (required if no positional args)
 *   -s, --state  State/region code (required if no positional args)
 *   -u, --units  One of: standard | metric | imperial (default: imperial)
 *   -h, --help   Show usage
 *
 * Env:
 *   WEATHER_API_URL - override the base API endpoint (default http://localhost:3001/api)
 */

const API_URL = process.env.WEATHER_API_URL || 'http://localhost:3001/api';

function usage(exitCode = 0) {
  console.log(`
Usage:
  node cli-client.js --city "Cincinnati" --state OH [--units imperial]
  node cli-client.js -c Cincinnati -s OH -u metric
  node cli-client.js "Cincinnati" "OH"

Options:
  -c, --city     City name
  -s, --state    State/region (e.g., OH)
  -u, --units    standard | metric | imperial  (default: imperial)
  -h, --help     Show this help

Environment:
  WEATHER_API_URL  Override API endpoint (default: http://localhost:3001/api)
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') return { help: true };
    if (a === '-c' || a === '--city') { args.city = argv[++i]; continue; }
    if (a === '-s' || a === '--state') { args.state = argv[++i]; continue; }
    if (a === '-u' || a === '--units') { args.units = argv[++i]; continue; }
    if (a.startsWith('--')) {
      const [k, v] = a.split('=');
      if (k === '--city') args.city = v;
      else if (k === '--state') args.state = v;
      else if (k === '--units') args.units = v;
      else { console.warn(`Unknown option: ${a}`); }
      continue;
    }
    args._.push(a);
  }
  // Positional fallback
  if (!args.city && args._[0]) args.city = args._[0];
  if (!args.state && args._[1]) args.state = args._[1];
  return args;
}

async function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  if (args.help) usage(0);
  const city = (args.city || '').trim();
  const state = (args.state || '').trim();
  const units = (args.units || 'imperial').trim().toLowerCase();

  if (!city || !state) {
    console.error('Error: city and state are required.\n');
    usage(1);
  }
  if (units && !['standard', 'metric', 'imperial'].includes(units)) {
    console.error('Error: units must be one of standard|metric|imperial\n');
    usage(1);
  }

  try {
    const u = new URL(API_URL);
    u.searchParams.set('city', city);
    u.searchParams.set('state', state);
    if (units) u.searchParams.set('units', units);

    const resp = await fetch(u);
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }
    const data = await resp.json();

    console.log();
    console.log("What's it like outside?");
    console.log(`Location: ${city}, ${state}`);
    console.log(`Description: ${data?.weather?.[0]?.main ?? 'N/A'}`);
    console.log(`Temperature: ${data?.main?.temp ?? 'N/A'}`);
    console.log(`Feels Like: ${data?.main?.feels_like ?? 'N/A'}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  }
}

main();
