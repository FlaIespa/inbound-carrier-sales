// server/utils/loadsearch.js

import fs from 'fs';
import path from 'path';

/**
 * Loads and parses loads.json (an array of load objects).
 * Each load object has properties: load_id, origin, destination, loadboard_rate, etc.
 */
function loadAllLoads() {
  const filePath = path.join(process.cwd(), 'server', 'loads.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading loads.json:', err);
    return [];
  }
}

/**
 * Given an origin and destination string, return an array of matching loads.
 * We perform a simple “case-insensitive substring” match on origin & destination.
 * Returns an array of load objects (could be empty if no match).
 */
export function searchLoads(origin, destination) {
  const allLoads = loadAllLoads();

  // Normalize to lowercase for case-insensitive comparison
  const origLower = origin.toLowerCase();
  const destLower = destination.toLowerCase();

  const matches = allLoads.filter((load) => {
    return (
      typeof load.origin === 'string' &&
      typeof load.destination === 'string' &&
      load.origin.toLowerCase().includes(origLower) &&
      load.destination.toLowerCase().includes(destLower)
    );
  });

  return matches;
}
