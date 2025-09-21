#!/usr/bin/env node

// Allow overriding the local API URL (useful when deployed)
const API_URL = process.env.WEATHER_API_URL || 'http://localhost:3001/api';

async function main() {
  try {
    const resp = await fetch(API_URL);
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }
    const data = await resp.json();

    console.log();
    console.log("What's it like outside?");
    console.log(`Description: ${data?.weather?.[0]?.main ?? 'N/A'}`);
    console.log(`Temperature: ${data?.main?.temp ?? 'N/A'}`);
    console.log(`Feels Like: ${data?.main?.feels_like ?? 'N/A'}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  }
}

main();
